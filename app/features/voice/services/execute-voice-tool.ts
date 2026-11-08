import { db } from "@/app/lib/db";
import { executeTool } from "@/app/features/tools/execute";
import { getDefaultAgentTools } from "@/app/features/agents/default-tools";
import { canAgentUseTool } from "@/app/features/runtime/tool-access";
import type { Agent } from "@/app/features/agents/types";
import type { Prisma } from "@/app/generated/prisma/client";

const VOICE_ALLOWED_TOOLS = new Set([
    "get_current_time",
    "list_datasets",
    "search_data",
]);

type ExecuteVoiceToolParams = {
    providerCallId: string;
    providerToolCallId: string;
    toolName: string;
    input: unknown;
};

function isUniqueConstraintError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

/**
 * Accepts only JSON-compatible objects.
 * Tool inputs and outputs in this integration are expected to be objects.
 */
function normalizeJsonObject(value: unknown): Prisma.InputJsonObject {
    if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
    ) {
        throw new Error("Tool input or output must be a JSON object");
    }

    const serialized = JSON.stringify(value);

    if (serialized === undefined) {
        throw new Error("Value cannot be serialized as JSON");
    }

    const parsed: unknown = JSON.parse(serialized);

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
    ) {
        throw new Error("Invalid JSON object");
    }

    return parsed as Prisma.InputJsonObject;
}

/**
 * Produces deterministic JSON for comparing repeated invocations.
 * Object key order does not affect the comparison.
 */
function stableJson(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableJson).join(",")}]`;
    }

    if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value).sort(([a], [b]) =>
            a.localeCompare(b),
        );

        return `{${entries
            .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
            .join(",")}}`;
    }

    return JSON.stringify(value) ?? "undefined";
}

export async function executeVoiceTool(
    params: ExecuteVoiceToolParams,
) {
    const {
        providerCallId,
        providerToolCallId,
        toolName,
        input,
    } = params;

    if (!providerCallId.trim() || !providerToolCallId.trim()) {
        throw new Error("Call ID and tool invocation ID are required");
    }

    if (!toolName.trim()) {
        throw new Error("Tool name is required");
    }

    // Validate input before creating an execution record.
    const jsonInput = normalizeJsonObject(input);

    // 1. Resolve the call and assigned agent from OPTR's database.
    const call = await db.call.findUnique({
        where: {
            providerCallId,
        },
        include: {
            voiceChannel: {
                include: {
                    agent: true,
                },
            },
        },
    });

    if (!call) {
        throw new Error("Voice call not found");
    }

    if (
        call.provider !== "RETELL" ||
        call.voiceChannel.provider !== "RETELL"
    ) {
        throw new Error("Voice provider mismatch");
    }

    if (!call.voiceChannel.isActive) {
        throw new Error("Voice channel is inactive");
    }

    if (
        !call.voiceChannel.agent.isActive ||
        call.voiceChannel.agent.businessId !== call.voiceChannel.businessId
    ) {
        throw new Error("Assigned agent is unavailable");
    }

    if (call.status !== "IN_PROGRESS") {
        throw new Error("Voice call is not active");
    }

    // 2. Enforce the voice-specific allowlist.
    if (!VOICE_ALLOWED_TOOLS.has(toolName)) {
        throw new Error(
            `Tool "${toolName}" is not available during voice calls`,
        );
    }

    // 3. Reconstruct the agent configuration.
    const agent: Agent = {
        id: call.voiceChannel.agent.id,
        businessId: call.voiceChannel.agent.businessId,
        name: call.voiceChannel.agent.name,
        description: call.voiceChannel.agent.description ?? undefined,
        instructions: call.voiceChannel.agent.instructions,
        model: call.voiceChannel.agent.model,
        temperature: call.voiceChannel.agent.temperature ?? undefined,
        isActive: call.voiceChannel.agent.isActive,
        tools: getDefaultAgentTools(),
    };

    if (!canAgentUseTool(agent, toolName)) {
        throw new Error(`Agent is not allowed to use "${toolName}"`);
    }

    // 4. Create an idempotency record.
    let execution;

    try {
        execution = await db.voiceToolExecution.create({
            data: {
                callId: call.id,
                providerToolCallId,
                toolName,
                input: jsonInput,
                status: "PENDING",
            },
        });
    } catch (error) {
        if (!isUniqueConstraintError(error)) {
            throw error;
        }

        execution = await db.voiceToolExecution.findUnique({
            where: {
                callId_providerToolCallId: {
                    callId: call.id,
                    providerToolCallId,
                },
            },
        });

        if (!execution) {
            throw new Error("Unable to resolve existing tool execution");
        }

        // Never reuse an invocation ID for a different request.
        const sameRequest =
            execution.toolName === toolName &&
            stableJson(execution.input) === stableJson(jsonInput);

        if (!sameRequest) {
            throw new Error(
                "Tool invocation ID was reused with different arguments",
            );
        }

        if (execution.status === "SUCCEEDED") {
            return {
                success: true,
                duplicate: true,
                data: execution.output,
            };
        }

        if (execution.status === "FAILED") {
            return {
                success: false,
                duplicate: true,
                error: execution.error ?? "Previous execution failed",
            };
        }

        return {
            success: false,
            duplicate: true,
            error: "Tool execution is already in progress",
        };
    }

    // 5. Claim or recover execution atomically.
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000);

    const claim = await db.voiceToolExecution.updateMany({
        where: {
            id: execution.id,
            OR: [
                { status: "PENDING" },
                {
                    status: "RUNNING",
                    startedAt: {
                        lt: staleThreshold,
                    },
                },
            ],
        },
        data: {
            status: "RUNNING",
            startedAt: now,
            completedAt: null,
            error: null,
        },
    });

    if (claim.count !== 1) {
        return {
            success: false,
            duplicate: true,
            error: "Tool execution is already in progress",
        };
    }

    // 6. Execute through the shared tool registry.
    const startedAt = Date.now();

    try {
        const result = await executeTool(
            toolName,
            jsonInput,
            {
                agentId: agent.id,
                businessId: call.voiceChannel.businessId,
            },
        );

        const durationMs = Date.now() - startedAt;

        if (!result.success) {
            await db.voiceToolExecution.update({
                where: {
                    id: execution.id,
                },
                data: {
                    status: "FAILED",
                    error: result.error ?? "Tool execution failed",
                    durationMs,
                    completedAt: new Date(),
                },
            });

            return {
                success: false,
                duplicate: false,
                error: result.error ?? "Tool execution failed",
            };
        }

        const jsonOutput = normalizeJsonObject(result.data);

        await db.voiceToolExecution.update({
            where: {
                id: execution.id,
            },
            data: {
                status: "SUCCEEDED",
                output: jsonOutput,
                durationMs,
                completedAt: new Date(),
            },
        });

        return {
            success: true,
            duplicate: false,
            data: jsonOutput,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown voice tool execution error";

        await db.voiceToolExecution.update({
            where: {
                id: execution.id,
            },
            data: {
                status: "FAILED",
                error: message,
                durationMs: Date.now() - startedAt,
                completedAt: new Date(),
            },
        });

        return {
            success: false,
            duplicate: false,
            error: message,
        };
    }
}
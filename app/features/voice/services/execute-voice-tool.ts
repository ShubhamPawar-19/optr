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

const STALE_EXECUTION_MS = 5 * 60 * 1000;

type ExecuteVoiceToolParams = {
    providerCallId: string;
    providerToolCallId: string;
    toolName: string;
    input: unknown;
};

type VoiceToolDependencies = {
    database: typeof db;
    runTool: typeof executeTool;
};

function isUniqueConstraintError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

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

function stableJson(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableJson).join(",")}]`;
    }

    if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value).sort(([a], [b]) =>
            a.localeCompare(b),
        );

        return `{${entries
            .map(
                ([key, item]) =>
                    `${JSON.stringify(key)}:${stableJson(item)}`,
            )
            .join(",")}}`;
    }

    return JSON.stringify(value) ?? "undefined";
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Unknown voice tool execution error";
}

export function createVoiceToolExecutor({
    database,
    runTool,
}: VoiceToolDependencies) {
    async function markExecutionFailed(
        executionId: string,
        error: string,
        durationMs: number,
    ) {
        await database.voiceToolExecution.update({
            where: { id: executionId },
            data: {
                status: "FAILED",
                error,
                durationMs,
                completedAt: new Date(),
            },
        });
    }

    return async function executeVoiceTool(
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

        const jsonInput = normalizeJsonObject(input);

        // 1. Resolve the call and assigned agent from OPTR's database.
        const call = await database.call.findUnique({
            where: { providerCallId },
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
            call.voiceChannel.agent.businessId !==
                call.voiceChannel.businessId
        ) {
            throw new Error("Assigned agent is unavailable");
        }

        if (call.status !== "IN_PROGRESS") {
            throw new Error("Voice call is not active");
        }

        // 2. Enforce the voice-specific tool allowlist.
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
            description:
                call.voiceChannel.agent.description ?? undefined,
            instructions: call.voiceChannel.agent.instructions,
            model: call.voiceChannel.agent.model,
            temperature:
                call.voiceChannel.agent.temperature ?? undefined,
            isActive: call.voiceChannel.agent.isActive,
            tools: getDefaultAgentTools(),
        };

        if (!canAgentUseTool(agent, toolName)) {
            throw new Error(`Agent is not allowed to use "${toolName}"`);
        }

        // 4. Create or resolve the idempotency record.
        let execution;

        try {
            execution = await database.voiceToolExecution.create({
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

            execution = await database.voiceToolExecution.findUnique({
                where: {
                    callId_providerToolCallId: {
                        callId: call.id,
                        providerToolCallId,
                    },
                },
            });

            if (!execution) {
                throw new Error(
                    "Unable to resolve existing tool execution",
                );
            }

            // Never reuse an invocation ID for different arguments.
            const sameRequest =
                execution.toolName === toolName &&
                stableJson(execution.input) === stableJson(jsonInput);

            if (!sameRequest) {
                throw new Error(
                    "Tool invocation ID was reused with different arguments",
                );
            }

            // Return the previously stored result.
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

            // PENDING and stale RUNNING executions continue to the claim step.
        }

        // 5. Atomically claim the execution.
        //
        // PENDING can always be claimed.
        // RUNNING can only be reclaimed after the stale threshold.
        //
        // Automatic stale recovery is currently safe because the voice
        // allowlist contains read-only tools. Side-effecting tools need
        // stronger external idempotency before being added to this allowlist.
        const now = new Date();
        const staleThreshold = new Date(
            now.getTime() - STALE_EXECUTION_MS,
        );

        const claim = await database.voiceToolExecution.updateMany({
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

        // 6. Execute the tool separately from result persistence.
        const startedAt = Date.now();

        let result;

        try {
            result = await runTool(
                toolName,
                jsonInput,
                {
                    agentId: agent.id,
                    businessId: call.voiceChannel.businessId,
                },
            );
        } catch (error) {
            const message = getErrorMessage(error);

            await markExecutionFailed(
                execution.id,
                message,
                Date.now() - startedAt,
            );

            return {
                success: false,
                duplicate: false,
                error: message,
            };
        }

        if (!result.success) {
            const message = result.error ?? "Tool execution failed";

            await markExecutionFailed(
                execution.id,
                message,
                Date.now() - startedAt,
            );

            return {
                success: false,
                duplicate: false,
                error: message,
            };
        }

        // 7. Validate and persist the successful result.
        let jsonOutput: Prisma.InputJsonObject;

        try {
            jsonOutput = normalizeJsonObject(result.data);
        } catch (error) {
            const message = getErrorMessage(error);

            await markExecutionFailed(
                execution.id,
                message,
                Date.now() - startedAt,
            );

            return {
                success: false,
                duplicate: false,
                error: "Tool returned an unsupported result",
            };
        }

        const durationMs = Date.now() - startedAt;

        try {
            await database.voiceToolExecution.update({
                where: { id: execution.id },
                data: {
                    status: "SUCCEEDED",
                    output: jsonOutput,
                    durationMs,
                    completedAt: new Date(),
                },
            });
        } catch (error) {
            // The tool already succeeded. Do not mark it FAILED just
            // because saving its result failed.
            //
            // These are read-only tools, so resetting to PENDING allows
            // a later request to safely execute and persist the result again.
            // If the database is unavailable, the RUNNING record can be
            // recovered by the stale-execution mechanism.
            try {
                await database.voiceToolExecution.updateMany({
                    where: {
                        id: execution.id,
                        status: "RUNNING",
                    },
                    data: {
                        status: "PENDING",
                        error: "Result persistence failed; retry required",
                        completedAt: null,
                    },
                });
            } catch (recoveryError) {
                console.error(
                    "[voice-tool] Failed to reset execution after persistence error",
                    {
                        executionId: execution.id,
                        error: getErrorMessage(recoveryError),
                    },
                );
            }

            console.error("[voice-tool] Result persistence failed", {
                executionId: execution.id,
                error: getErrorMessage(error),
            });

            return {
                success: false,
                duplicate: false,
                retryable: true,
                error: "Tool completed, but its result could not be saved.",
            };
        }

        return {
            success: true,
            duplicate: false,
            data: jsonOutput,
        };
    };
}

// Production executor. Existing imports remain unchanged.
export const executeVoiceTool = createVoiceToolExecutor({
    database: db,
    runTool: executeTool,
});

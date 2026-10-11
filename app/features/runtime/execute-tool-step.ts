
import { executeTool } from "../tools/execute";
import type { ToolContext } from "../tools/types";
import { addAgentStep } from "./add-step";
import type { RuntimeContext } from "./types";
import { canAgentUseTool } from "./tool-access";

export async function executeToolStep(
    context: RuntimeContext,
    toolName: string,
    input: unknown,
    toolContext: ToolContext,
): Promise<RuntimeContext> {
    const startedAt = Date.now();
    const stepId = crypto.randomUUID();

    try {
        if (!canAgentUseTool(context.agent, toolName)) {
            throw new Error(
                `Agent "${context.agent.id}" is not allowed to use tool "${toolName}"`,
            );
        }

        const result = await executeTool(
            toolName,
            input,
            toolContext,
        );

        if (!result.success) {
            return addAgentStep(context, {
                id: stepId,
                runId: context.run.id,
                type: "TOOL",
                status: "FAILED",
                durationMs: Date.now() - startedAt,
                error: result.error ?? "Tool execution failed",
                toolName,
                input,
                toolResult: result,
                createdAt: new Date(),
            });
        }

        return addAgentStep(context, {
            id: stepId,
            runId: context.run.id,
            type: "TOOL",
            status: "SUCCEEDED",
            durationMs: Date.now() - startedAt,
            toolName,
            input,
            output: result.data,
            toolResult: result,
            createdAt: new Date(),
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown tool execution error";

        return addAgentStep(context, {
            id: stepId,
            runId: context.run.id,
            type: "TOOL",
            status: "FAILED",
            durationMs: Date.now() - startedAt,
            error: message,
            toolName,
            input,
            createdAt: new Date(),
        });
    }
}
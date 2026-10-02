import { executeTool } from "../tools/execute";
import type { ToolContext } from "../tools/types";
import { addAgentStep } from "./add-step";
import { canAgentUseTool } from "./tool-access";
import type { RuntimeContext } from "./types";

export async function executeToolStep(
    context: RuntimeContext,
    toolName: string,
    input: unknown,
    toolContext: ToolContext,
): Promise<RuntimeContext> {
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

    return addAgentStep(context, {
        id: crypto.randomUUID(),
        runId: context.run.id,
        type: "TOOL",
        toolName,
        input,
        output: result.data,
        toolResult: result,
        createdAt: new Date(),
    });
}
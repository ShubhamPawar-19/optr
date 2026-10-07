import { tool, type Tool } from "ai";
import { getAllTools } from "../tools/registry";
import type { ToolContext } from "../tools/types";

export function getAITools(
    enabledToolNames: string[],
    context: ToolContext,
): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    for (const optrTool of getAllTools()) {
        if (!enabledToolNames.includes(optrTool.name)) {
            continue;
        }

        tools[optrTool.name] = tool({
            description: optrTool.description,
            inputSchema: optrTool.parameters,
            execute: async (input) => {
                return optrTool.execute(input, context);
            },
        });
    }

    return tools;
}
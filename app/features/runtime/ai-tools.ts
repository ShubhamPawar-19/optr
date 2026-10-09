import { tool, type Tool } from "ai";
import { getAllTools } from "../tools/registry";

export function getAITools(
    enabledToolNames: string[],
): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    for (const optrTool of getAllTools()) {
        if (!enabledToolNames.includes(optrTool.name)) {
            continue;
        }

        tools[optrTool.name] = tool({
            description: optrTool.description,
            inputSchema: optrTool.parameters,
        });
    }

    return tools;
}
import { getTool } from "./registry";
import type { ToolContext } from "./types";

export async function executeTool(
    name: string,
    input: unknown,
    context: ToolContext,
) {
    const tool = getTool(name);

    if (!tool) {
        return {
            success: false,
            error: `Tool "${name}" not found`,
        };
    }

    const parsedInput = tool.parameters.safeParse(input);

    if (!parsedInput.success) {
        return {
            success: false,
            error: "Invalid tool input",
        };
    }

    return tool.execute(parsedInput.data, context);
}
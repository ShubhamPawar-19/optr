import type { OptrTool } from "./types";
import { getCurrentTimeTool } from "./get-current-time";
import { searchPropertiesTool } from "./search-properties";

const toolRegistry = new Map<string, OptrTool>();

export function registerTool(tool: OptrTool) {
    if (toolRegistry.has(tool.name)) {
        throw new Error(`Tool "${tool.name}" is already registered`);
    }

    toolRegistry.set(tool.name, tool);
}

export function getTool(name: string): OptrTool | undefined {
    return toolRegistry.get(name);
}

export function getAllTools(): OptrTool[] {
    return Array.from(toolRegistry.values());
}

registerTool(getCurrentTimeTool);
registerTool(searchPropertiesTool);
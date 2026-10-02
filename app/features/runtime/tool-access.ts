import type { Agent } from "../agents/types";

export function canAgentUseTool(
    agent: Agent,
    toolName: string,
): boolean {
    const tool = agent.tools.find(
        (tool) => tool.name === toolName,
    );

    return tool?.enabled === true;
}
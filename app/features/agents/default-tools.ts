import type { AgentToolConfig } from "./types";

export function getDefaultAgentTools(): AgentToolConfig[] {
    return [
        { name: "get_current_time", enabled: true },
        { name: "search_data", enabled: true },
        { name: "list_datasets", enabled: true },
    ];
}
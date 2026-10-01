export interface Agent {
    id: string;

    name: string;

    description?: string;

    instructions: string;

    model: string;

    temperature?: number;

    isActive: boolean;

    tools: AgentToolConfig[];
}

export interface AgentToolConfig {
    name: string;

    enabled: boolean;

    config?: Record<string, unknown>;
}
import type { Agent } from "../agents/types";
import type { NormalizedEvent } from "../events/types";
import type { ToolResult } from "../tools/types";

export interface AgentRun {
    id: string;

    agentId: string;

    eventId?: string;

    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

    stepCount: number;

    startedAt: Date;

    completedAt?: Date;

    error?: string;
}

export type AgentStepType =
    | "LLM"
    | "TOOL"
    | "MEMORY"
    | "APPROVAL";

export interface AgentStep {
    id: string;

    runId: string;

    type: AgentStepType;

    input?: unknown;

    output?: unknown;

    toolName?: string;

    toolResult?: ToolResult;

    createdAt: Date;
}

export interface RuntimeContext {
    agent: Agent;
    event?: NormalizedEvent;
    conversationId?: string;
    run: AgentRun;
    steps: AgentStep[];
}
import type { Agent } from "../agents/types";
import type { NormalizedEvent } from "../events/types";
import type { AgentRun, RuntimeContext } from "./types";

export function createAgentRun(
    agent: Agent,
    event?: NormalizedEvent,
    conversationId?: string,
): RuntimeContext {
    const run: AgentRun = {
        id: crypto.randomUUID(),
        agentId: agent.id,
        eventId: event?.id,
        status: "PENDING",
        stepCount: 0,
        startedAt: new Date(),
    };

    return {
        agent,
        event,
        conversationId,
        run,
        steps: [],
    };
}
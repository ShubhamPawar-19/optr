import type { Agent } from "../agents/types";
import type { NormalizedEvent } from "./types";

export interface EventGatewayInput {
    event: NormalizedEvent;
    agent: Agent;
}

export interface EventGatewayResult {
    eventId: string;
    runId: string;
    status: "COMPLETED" | "FAILED";
}
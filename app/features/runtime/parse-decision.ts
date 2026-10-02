import {
    agentDecisionSchema,
    type AgentDecision,
} from "./decision";

export function parseAgentDecision(
    input: unknown,
): AgentDecision {
    const result = agentDecisionSchema.safeParse(input);

    if (!result.success) {
        throw new Error("Invalid agent decision");
    }

    return result.data;
}
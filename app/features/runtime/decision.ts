import { z } from "zod";

export const agentDecisionSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("FINAL"),
        response: z.string(),
    }),

    z.object({
        type: z.literal("TOOL"),
        toolName: z.string(),
        input: z.unknown(),
    }),
]);

export type AgentDecision = z.infer<
    typeof agentDecisionSchema
>;
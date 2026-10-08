import type { z } from "zod";

export interface ToolContext {
    agentId: string;
    businessId: string;
    userId: string;
    runId: string;
    event?: { id: string };
}

export interface ToolResult {
    success: boolean;

    data?: unknown;

    error?: string;
}

export interface OptrTool<TSchema extends z.ZodType = z.ZodType> {
    name: string;

    description: string;

    parameters: TSchema;

    execute: (
        input: z.infer<TSchema>,
        context: ToolContext,
    ) => Promise<ToolResult>;
}
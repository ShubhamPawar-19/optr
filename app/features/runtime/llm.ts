import type { Tool } from "ai";

export interface LLMRequest {
    model: string;
    system: string;
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    tools?: Record<string, Tool>;
}

export interface LLMResponse {
    content: string;
    toolCalls?: {
        toolName: string;
        input: unknown;
    }[];
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
    };
}

export interface LLMProvider {
    generate(request: LLMRequest): Promise<LLMResponse>;
}
export interface LLMRequest {
    model: string;

    system: string;

    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
}

export interface LLMResponse {
    content: string;

    usage?: {
        inputTokens?: number;
        outputTokens?: number;
    };
}

export interface LLMProvider {
    generate(request: LLMRequest): Promise<LLMResponse>;
}
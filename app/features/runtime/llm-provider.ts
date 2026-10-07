import {
    generateText,
    type ModelMessage,
    type Tool,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type {
    LLMProvider,
    LLMRequest,
    LLMResponse,
} from "./llm";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export class VercelAIProvider implements LLMProvider {
    constructor(
        private readonly modelName: string,
    ) {}

    async generate(
        request: LLMRequest,
    ): Promise<LLMResponse> {
        const messages: ModelMessage[] =
            request.messages.map((message) => ({
                role: message.role,
                content: message.content,
            }));

        const result = await generateText({
            model: openrouter(this.modelName),
            system: request.system,
            messages,
            tools: request.tools as Record<string, Tool> | undefined,
            maxOutputTokens: 2048,
        });

        return {
            content: result.text,
            toolCalls: result.toolCalls?.map((call) => ({
                toolName: call.toolName,
                input: call.input,
            })),
            usage: {
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
            },
        };
    }
}
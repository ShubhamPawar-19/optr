import { generateText, type ModelMessage } from "ai";

import type {
    LLMProvider,
    LLMRequest,
    LLMResponse,
} from "./llm";

export class VercelAIProvider implements LLMProvider {
    constructor(
        private readonly modelProvider: Parameters<
            typeof generateText
        >[0]["model"],
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
            model: this.modelProvider,
            system: request.system,
            messages,
        });

        return {
            content: result.text,

            usage: {
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
            },
        };
    }
}
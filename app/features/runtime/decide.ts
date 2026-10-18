
import { getAITools } from "./ai-tools";
import type { LLMProvider } from "./llm";
import type { AgentDecision } from "./decision";
import type { RuntimeContext } from "./types";
import { getConversationContext } from "../conversations/context";

export async function decideNextAction(
    provider: LLMProvider,
    context: RuntimeContext,
    userId: string,
): Promise<AgentDecision> {
    const enabledToolNames = context.agent.tools
        .filter((tool) => tool.enabled)
        .map((tool) => tool.name);

    const tools = getAITools(enabledToolNames);

    const currentMessage = context.event?.content?.text?.trim();

    const event = context.event
        ? JSON.stringify(context.event, null, 2)
        : "No event.";

    const previousSteps =
        context.steps.length > 0
            ? JSON.stringify(
                context.steps.map((step) => ({
                    type: step.type,
                    toolName: step.toolName,
                    input: step.input,
                    output: step.output,
                    toolResult: step.toolResult,
                })),
                null,
                2,
            )
            : "No previous steps.";

    const conversationMessages = context.conversationId
        ? await getConversationContext(
            context.conversationId,
            context.agent.id,
        )
        : [];

    console.log("[OPTR Decide Input]", {
        conversationId: context.conversationId,
        currentMessage,
        historyCount: conversationMessages.length,
        history: conversationMessages,
        model: context.agent.model,
        enabledToolNames,
    });

    const response = await provider.generate({
        model: context.agent.model,

        system: `${context.agent.instructions}

CONVERSATION HANDLING RULES:
- Treat CURRENT USER MESSAGE in the latest request context as the user's current message.
- Use conversation history to understand references such as "it", "that property", "the cheaper one", and follow-up questions.
- Never claim the conversation is new when relevant history is provided.
- Preserve previously stated preferences, including city, budget, and bedroom count, unless the user explicitly changes them.
- When the user changes one preference, update that preference while preserving unrelated preferences.
- For follow-up questions about a previously discussed property, use the available conversation history to identify the property.
- Use available tools when fresh inventory data or an action is required.
- Do not invent property details, amenities, availability, or prices.
- Only state specific property features when supported by inventory data or reliable conversation context.
- If the available information does not answer the user's question, explain what is missing instead of guessing.
- For greetings, acknowledgements, and goodbyes, respond naturally without unnecessary tool calls.
- When the user's intent is ambiguous and cannot be resolved from the conversation, ask one concise clarifying question.`,

        messages: [
            ...conversationMessages,
            {
                role: "user" as const,
                content: `
CURRENT USER MESSAGE:
${currentMessage || "No text message available."}

CURRENT EVENT:
${event}

PREVIOUS STEPS:
${previousSteps}

Determine the next action based on the current user message, conversation history, and available tools.

If a tool is needed, select the appropriate available tool and provide its required input.
If the request is complete or no tool is needed, respond naturally to the user.
`,
            },
        ],

        tools,
    });

    console.log("[OPTR Decide Output]", {
        content: response.content,
        toolCalls: response.toolCalls,
    });

    if (response.toolCalls?.length) {
        const toolCall = response.toolCalls[0];

        return {
            type: "TOOL",
            toolName: toolCall.toolName,
            input: toolCall.input,
        };
    }

    return {
        type: "FINAL",
        response: response.content,
    };
}

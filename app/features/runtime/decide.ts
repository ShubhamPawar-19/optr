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
        ? await getConversationContext(context.conversationId)
        : [];

    const response = await provider.generate({
        model: context.agent.model,

        system: context.agent.instructions,

        messages: [
            ...conversationMessages,
            {
                role: "user" as const,
                content: `
CURRENT EVENT:
${event}

PREVIOUS STEPS:
${previousSteps}

Decide what to do next.

Use an available tool when you need information or need to perform an action.

When the task is complete, respond naturally to the user.
`,
            },
        ],

        tools,
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
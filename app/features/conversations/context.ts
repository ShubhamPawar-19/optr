
import { getConversationMessages } from "./service";

export async function getConversationContext(
    conversationId: string,
    agentId: string,
) {
    const messages = await getConversationMessages(
        conversationId,
        agentId,
    );

    return messages.map((message) => ({
        role:
            message.role === "USER"
                ? ("user" as const)
                : ("assistant" as const),
        content: message.content,
    }));
}
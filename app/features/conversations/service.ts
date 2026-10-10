
import { db } from "../../lib/db";

export async function getOrCreateConversation(params: {
    agentId: string;
    channel: string;
    externalId: string;
}) {
    return db.conversation.upsert({
        where: {
            agentId_channel_externalId: {
                agentId: params.agentId,
                channel: params.channel,
                externalId: params.externalId,
            },
        },
        update: {},
        create: {
            id: crypto.randomUUID(),
            agentId: params.agentId,
            channel: params.channel,
            externalId: params.externalId,
        },
    });
}

export async function createMessage(params: {
    conversationId: string;
    role: string;
    content: string;
    externalId?: string;
}) {
    return db.message.create({
        data: {
            id: crypto.randomUUID(),
            conversationId: params.conversationId,
            role: params.role,
            content: params.content,
            externalId: params.externalId,
        },
    });
}


export async function getConversationMessages(
    conversationId: string,
    agentId: string,
) {
    const conversation = await db.conversation.findFirst({
        where: {
            id: conversationId,
            agentId,
        },
        select: {
            id: true,
        },
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return db.message.findMany({
        where: {
            conversationId: conversation.id,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}
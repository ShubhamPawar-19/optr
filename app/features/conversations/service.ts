import { db } from "../../lib/db";

export async function getOrCreateConversation(params: {
    agentId: string;
    channel: string;
    externalId: string;
}) {
    return db.conversation.upsert({
        where: {
            channel_externalId: {
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
) {
    return db.message.findMany({
        where: {
            conversationId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}
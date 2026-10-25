
import "server-only";

import { db } from "@/app/lib/db";

const DEMO_BUSINESS_ID = "demo-business";

export async function listConversations() {
    const agents = await db.agent.findMany({
        where: {
            businessId: DEMO_BUSINESS_ID,
        },
        select: {
            id: true,
        },
    });

    const conversations = await db.conversation.findMany({
        where: {
            agentId: {
                in: agents.map((agent) => agent.id),
            },
        },
        select: {
            id: true,
            agentId: true,
            channel: true,
            externalId: true,
            createdAt: true,
            updatedAt: true,
            contact: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                },
            },
            messages: {
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    messages: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return conversations;
}


import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function listConversations() {
    const business = await getCurrentBusiness();

    if (!business) {
        return [];
    }

    const agents = await db.agent.findMany({
        where: {
            businessId: business.id,
        },
        select: {
            id: true,
        },
    });

    if (agents.length === 0) {
        return [];
    }

    return db.conversation.findMany({
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
}

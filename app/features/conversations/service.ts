import { db } from "../../lib/db";
import type { OutboundMessageStatus } from "../../generated/prisma/client";
import { getOutboundStatusTransition } from "./outbound-status";
import { decidePendingWhatsAppStatus } from "./pending-status-reconciliation";


export async function getOrCreateConversation(params: {
    agentId: string;
    channel: string;
    externalId: string;
    phoneNumberId?: string;
}) {
    if (params.channel === "WHATSAPP") {
        if (!params.phoneNumberId) {
            throw new Error("WhatsApp conversation requires a phone number ID");
        }

        const [agent, channel] = await Promise.all([
            db.agent.findUnique({
                where: { id: params.agentId },
                select: { businessId: true, isActive: true },
            }),
            db.whatsAppChannel.findUnique({
                where: { phoneNumberId: params.phoneNumberId },
                select: { businessId: true, isActive: true },
            }),
        ]);

        if (
            !agent ||
            !agent.isActive ||
            !channel ||
            !channel.isActive ||
            agent.businessId !== channel.businessId
        ) {
            throw new Error("WhatsApp channel does not belong to the active agent's business");
        }
    }

    return db.conversation.upsert({
        where: {
            agentId_channel_externalId: {
                agentId: params.agentId,
                channel: params.channel,
                externalId: params.externalId,
            },
        },
        update: params.phoneNumberId
            ? { phoneNumberId: params.phoneNumberId }
            : {},
        create: {
            id: crypto.randomUUID(),
            agentId: params.agentId,
            channel: params.channel,
            externalId: params.externalId,
            phoneNumberId: params.phoneNumberId,
        },
    });
}


export async function createMessage(params: {
    conversationId: string;
    role: string;
    content: string;
    externalId?: string;
    outboundStatus?: OutboundMessageStatus;
}) {
    return db.message.create({
        data: {
            id: crypto.randomUUID(),
            conversationId: params.conversationId,
            role: params.role,
            content: params.content,
            externalId: params.externalId,
            outboundStatus: params.outboundStatus,
        },
    });
}

export async function createOutboundMessage(params: {
    conversationId: string;
    content: string;
}) {
    return db.message.create({
        data: {
            id: crypto.randomUUID(),
            conversationId: params.conversationId,
            role: "ASSISTANT",
            content: params.content,
            outboundStatus: "PENDING",
        },
    });
}

/**
 * Returns WhatsApp conversation IDs belonging to the supplied business
 * and exact WhatsApp phone-number channel.
 */
async function getWhatsAppConversationIds(
    businessId: string,
    phoneNumberId: string,
) {
    const agents = await db.agent.findMany({
        where: { businessId },
        select: { id: true },
    });

    if (agents.length === 0) {
        return [];
    }

    const conversations = await db.conversation.findMany({
        where: {
            channel: "WHATSAPP",
            phoneNumberId,
            agentId: {
                in: agents.map((agent) => agent.id),
            },
        },
        select: { id: true },
    });

    return conversations.map((conversation) => conversation.id);
}

async function isActiveWhatsAppChannelOwnedByBusiness(
    businessId: string,
    phoneNumberId: string,
) {
    const channel = await db.whatsAppChannel.findFirst({
        where: {
            businessId,
            phoneNumberId,
            isActive: true,
        },
        select: { id: true },
    });

    return Boolean(channel);
}

export async function claimOutboundMessage(params: {
    messageId: string;
    businessId: string;
    phoneNumberId: string;
}) {
    const channelIsValid = await isActiveWhatsAppChannelOwnedByBusiness(
        params.businessId,
        params.phoneNumberId,
    );

    if (!channelIsValid) {
        return false;
    }

    const conversationIds = await getWhatsAppConversationIds(
        params.businessId,
        params.phoneNumberId,
    );

    if (conversationIds.length === 0) {
        return false;
    }

    const result = await db.message.updateMany({
        where: {
            id: params.messageId,
            conversationId: { in: conversationIds },
            conversation: {
                is: {
                    channel: "WHATSAPP",
                    phoneNumberId: params.phoneNumberId,
                },
            },
            role: "ASSISTANT",
            outboundStatus: "PENDING",
        },
        data: {
            outboundStatus: "SENDING",
            outboundError: null,
            sendStartedAt: new Date(),
        },
    });

    return result.count === 1;
}

export async function updateOutboundMessage(params: {
    messageId: string;
    businessId: string;
    phoneNumberId: string;
    status: "SENT" | "UNKNOWN";
    externalId?: string;
    error?: string;
}) {
    const channelIsValid = await isActiveWhatsAppChannelOwnedByBusiness(
        params.businessId,
        params.phoneNumberId,
    );

    if (!channelIsValid) {
        return { count: 0 };
    }

    const conversationIds = await getWhatsAppConversationIds(
        params.businessId,
        params.phoneNumberId,
    );

    if (conversationIds.length === 0) {
        return { count: 0 };
    }

    const scopedWhere = {
        id: params.messageId,
        conversationId: { in: conversationIds },
        conversation: {
            is: {
                channel: "WHATSAPP" as const,
                phoneNumberId: params.phoneNumberId,
            },
        },
        role: "ASSISTANT",
    };

    if (params.status === "SENT") {
        const result = await db.message.updateMany({
            where: {
                ...scopedWhere,
                outboundStatus: {
                    in: ["SENDING", "UNKNOWN"],
                },
            },
            data: {
                outboundStatus: "SENT",
                ...(params.externalId !== undefined
                    ? { externalId: params.externalId }
                    : {}),
                sentAt: new Date(),
                outboundError: null,
            },
        });

        if (result.count === 1) {
            return result;
        }

        // Attach the Meta ID without overwriting a status already
        // advanced by a delivery callback.
        return db.message.updateMany({
            where: {
                ...scopedWhere,
                outboundStatus: {
                    in: ["SENT", "DELIVERED", "READ", "FAILED"],
                },
            },
            data: {
                ...(params.externalId !== undefined
                    ? { externalId: params.externalId }
                    : {}),
            },
        });
    }

    // A send error must not overwrite a status already advanced by a callback.
    return db.message.updateMany({
        where: {
            ...scopedWhere,
            outboundStatus: "SENDING",
        },
        data: {
            outboundStatus: "UNKNOWN",
            ...(params.error !== undefined
                ? { outboundError: params.error }
                : {}),
        },
    });
}

export async function savePendingWhatsAppStatus(params: {
    phoneNumberId: string;
    externalId: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: number;
    error?: string;
}) {
    return db.whatsAppPendingStatus.upsert({
        where: {
            phoneNumberId_externalId_status_timestamp: {
                phoneNumberId: params.phoneNumberId,
                externalId: params.externalId,
                status: params.status,
                timestamp: BigInt(params.timestamp),
            },
        },
        update: {},
        create: {
            phoneNumberId: params.phoneNumberId,
            externalId: params.externalId,
            status: params.status,
            timestamp: BigInt(params.timestamp),
            error: params.error,
        },
    });
}

export async function reconcilePendingWhatsAppStatuses(
    phoneNumberId: string,
    externalId: string,
    businessId: string,
) {
    const pendingStatuses = await db.whatsAppPendingStatus.findMany({
        where: {
            phoneNumberId,
            externalId,
            processedAt: null,
        },
        orderBy: [{ timestamp: "asc" }, { createdAt: "asc" }],
    });

    if (pendingStatuses.length === 0) {
        return { reconciled: 0 };
    }

    const conversationIds = await getWhatsAppConversationIds(
        businessId,
        phoneNumberId,
    );

    if (conversationIds.length === 0) {
        return { reconciled: 0 };
    }

    let reconciled = 0;

    for (const pending of pendingStatuses) {
        const timestamp = Number(pending.timestamp);

        const message = await db.message.findFirst({
            where: {
                conversationId: { in: conversationIds },
                conversation: {
                    is: {
                        channel: "WHATSAPP",
                        phoneNumberId,
                    },
                },
                externalId: pending.externalId,
                role: "ASSISTANT",
                outboundStatus: {
                    in: [
                        "SENDING",
                        "SENT",
                        "DELIVERED",
                        "READ",
                        "FAILED",
                        "UNKNOWN",
                    ],
                },
            },
            select: {
                outboundStatus: true,
            },
        });

        const decision = decidePendingWhatsAppStatus({
            currentStatus: message?.outboundStatus ?? null,
            pending: {
                id: pending.id,
                externalId: pending.externalId,
                status: pending.status as
                    | "sent"
                    | "delivered"
                    | "read"
                    | "failed",
                timestamp,
                error: pending.error ?? undefined,
            },
        });

        if (decision.action === "keep-pending") {
            continue;
        }

        if (decision.action === "apply") {
            const result = await updateOutboundMessageFromWhatsAppStatus({
                phoneNumberId,
                businessId,
                externalId: pending.externalId,
                status: pending.status as
                    | "sent"
                    | "delivered"
                    | "read"
                    | "failed",
                timestamp: decision.timestamp,
                error: decision.error,
            });

            if (
                !result.updated &&
                result.reason !== "stale-or-duplicate-status"
            ) {
                continue;
            }
        }

        const marked = await db.whatsAppPendingStatus.updateMany({
            where: {
                id: pending.id,
                phoneNumberId,
                processedAt: null,
            },
            data: {
                processedAt: new Date(),
            },
        });

        reconciled += marked.count;
    }

    return { reconciled };
}

export async function updateOutboundMessageFromWhatsAppStatus(params: {
    phoneNumberId: string;
    businessId: string;
    externalId: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: number;
    error?: string;
}) {
    const statusTime = new Date(params.timestamp * 1000);

    if (
        !Number.isSafeInteger(params.timestamp) ||
        params.timestamp <= 0 ||
        Number.isNaN(statusTime.getTime())
    ) {
        return {
            updated: false as const,
            reason: "invalid-timestamp" as const,
        };
    }

    const channelIsValid = await isActiveWhatsAppChannelOwnedByBusiness(
        params.businessId,
        params.phoneNumberId,
    );

    if (!channelIsValid) {
        return {
            updated: false as const,
            reason: "message-not-found" as const,
        };
    }

    const conversationIds = await getWhatsAppConversationIds(
        params.businessId,
        params.phoneNumberId,
    );

    if (conversationIds.length === 0) {
        return {
            updated: false as const,
            reason: "message-not-found" as const,
        };
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        const message = await db.message.findFirst({
            where: {
                conversationId: { in: conversationIds },
                conversation: {
                    is: {
                        channel: "WHATSAPP",
                        phoneNumberId: params.phoneNumberId,
                    },
                },
                externalId: params.externalId,
                role: "ASSISTANT",
                outboundStatus: {
                    in: [
                        "SENDING",
                        "SENT",
                        "DELIVERED",
                        "READ",
                        "FAILED",
                        "UNKNOWN",
                    ],
                },
            },
            select: {
                id: true,
                outboundStatus: true,
            },
        });

        if (!message?.outboundStatus) {
            return {
                updated: false as const,
                reason: "message-not-found" as const,
            };
        }

        const transition = getOutboundStatusTransition(
            message.outboundStatus,
            params.status,
        );

        if (!transition.shouldUpdate) {
            return {
                updated: false as const,
                reason: "stale-or-duplicate-status" as const,
            };
        }

        const result = await db.message.updateMany({
            where: {
                id: message.id,
                conversationId: { in: conversationIds },
                conversation: {
                    is: {
                        channel: "WHATSAPP",
                        phoneNumberId: params.phoneNumberId,
                    },
                },
                outboundStatus: message.outboundStatus,
            },
            data: {
                outboundStatus: transition.status,
                ...(params.status === "sent" ? { sentAt: statusTime } : {}),
                ...(params.status === "delivered"
                    ? { deliveredAt: statusTime }
                    : {}),
                ...(params.status === "read" ? { readAt: statusTime } : {}),
                ...(params.status === "failed"
                    ? {
                        outboundError:
                            params.error ?? "WhatsApp delivery failed",
                    }
                    : {}),
            },
        });

        if (result.count === 1) {
            return {
                updated: true as const,
                status: transition.status,
            };
        }
    }

    return {
        updated: false as const,
        reason: "concurrent-status-update" as const,
    };
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

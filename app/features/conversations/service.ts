import { db } from "../../lib/db";
import type { OutboundMessageStatus } from "../../generated/prisma/client";
import { getOutboundStatusTransition } from "./outbound-status";
import { decidePendingWhatsAppStatus } from "./pending-status-reconciliation";

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

export async function claimOutboundMessage(messageId: string) {
    const result = await db.message.updateMany({
        where: {
            id: messageId,
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
    status: "SENT" | "UNKNOWN";
    externalId?: string;
    error?: string;
}) {
    if (params.status === "SENT") {
        const result = await db.message.updateMany({
            where: {
                id: params.messageId,
                role: "ASSISTANT",
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

        // If a callback already advanced the status, attach the Meta ID
        // without changing that status. Do not attach it to an unexpected state.
        return db.message.updateMany({
            where: {
                id: params.messageId,
                role: "ASSISTANT",
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
            id: params.messageId,
            role: "ASSISTANT",
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
    externalId: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: number;
    error?: string;
}) {
    return db.whatsAppPendingStatus.upsert({
        where: {
            externalId_status_timestamp: {
                externalId: params.externalId,
                status: params.status,
                timestamp: BigInt(params.timestamp),
            },
        },
        update: {},
        create: {
            externalId: params.externalId,
            status: params.status,
            timestamp: BigInt(params.timestamp),
            error: params.error,
        },
    });
}


export async function reconcilePendingWhatsAppStatuses(externalId: string) {
    const pendingStatuses = await db.whatsAppPendingStatus.findMany({
        where: {
            externalId,
            processedAt: null,
        },
        orderBy: [
            { timestamp: "asc" },
            { createdAt: "asc" },
        ],
    });

    let reconciled = 0;

    for (const pending of pendingStatuses) {
        const timestamp = Number(pending.timestamp);

        const message = await db.message.findFirst({
            where: {
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
        return { updated: false as const, reason: "invalid-timestamp" as const };
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        const message = await db.message.findFirst({
            where: {
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

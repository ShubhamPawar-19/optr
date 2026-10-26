
export type WhatsAppDeliveryStatus = "sent" | "delivered" | "read" | "failed";

export type TrackedOutboundStatus =
    | "PENDING"
    | "SENDING"
    | "SENT"
    | "DELIVERED"
    | "READ"
    | "FAILED"
    | "UNKNOWN";

export type OutboundStatusTransition = {
    status: TrackedOutboundStatus;
    shouldUpdate: boolean;
};

export function getOutboundStatusTransition(
    current: TrackedOutboundStatus,
    incoming: WhatsAppDeliveryStatus,
): OutboundStatusTransition {
    const target: Record<WhatsAppDeliveryStatus, TrackedOutboundStatus> = {
        sent: "SENT",
        delivered: "DELIVERED",
        read: "READ",
        failed: "FAILED",
    };

    const next = target[incoming];

    // Delivery progression is monotonic. FAILED is terminal unless a later
    // delivered/read callback provides stronger evidence of successful delivery.
    const rank: Record<TrackedOutboundStatus, number> = {
        PENDING: 0,
        SENDING: 1,
        UNKNOWN: 1,
        SENT: 2,
        FAILED: 2,
        DELIVERED: 3,
        READ: 4,
    };

    if (current === "READ" || current === next) {
        return { status: current, shouldUpdate: false };
    }

    if (rank[next] <= rank[current]) {
        return { status: current, shouldUpdate: false };
    }

    return { status: next, shouldUpdate: true };
}

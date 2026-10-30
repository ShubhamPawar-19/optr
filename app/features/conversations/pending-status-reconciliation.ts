import {
    getOutboundStatusTransition,
    type TrackedOutboundStatus,
    type WhatsAppDeliveryStatus,
} from "./outbound-status.ts";

export type PendingWhatsAppStatus = {
    id: string;
    externalId: string;
    status: WhatsAppDeliveryStatus;
    timestamp: number;
    error?: string;
};

export type PendingStatusDecision =
    | {
          action: "apply";
          status: TrackedOutboundStatus;
          timestamp: number;
          error?: string;
      }
    | { action: "mark-processed" }
    | { action: "keep-pending" };

const VALID_WHATSAPP_STATUSES = new Set<string>([
    "sent",
    "delivered",
    "read",
    "failed",
]);

function isWhatsAppDeliveryStatus(
    status: unknown,
): status is WhatsAppDeliveryStatus {
    return typeof status === "string" && VALID_WHATSAPP_STATUSES.has(status);
}

export function decidePendingWhatsAppStatus(params: {
    currentStatus: TrackedOutboundStatus | null;
    pending: Omit<PendingWhatsAppStatus, "status"> & {
        status: unknown;
    };
}): PendingStatusDecision {
    const { currentStatus, pending } = params;

    if (
        !isWhatsAppDeliveryStatus(pending.status) ||
        !Number.isSafeInteger(pending.timestamp) ||
        pending.timestamp <= 0
    ) {
        return { action: "keep-pending" };
    }

    if (!currentStatus) {
        return { action: "keep-pending" };
    }

    const transition = getOutboundStatusTransition(
        currentStatus,
        pending.status,
    );

    if (!transition.shouldUpdate) {
        return { action: "mark-processed" };
    }

    return {
        action: "apply",
        status: transition.status,
        timestamp: pending.timestamp,
        error: pending.error,
    };
}
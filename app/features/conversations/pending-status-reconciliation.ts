import {
    getOutboundStatusTransition,
    type TrackedOutboundStatus,
    type WhatsAppDeliveryStatus,
} from "./outbound-status";

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

export function decidePendingWhatsAppStatus(params: {
    currentStatus: TrackedOutboundStatus | null;
    pending: PendingWhatsAppStatus;
}): PendingStatusDecision {
    const { currentStatus, pending } = params;

    if (
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
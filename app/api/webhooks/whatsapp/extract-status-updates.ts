
import type { ValidWhatsAppWebhookPayload } from "./parse-payload.ts";

export type WhatsAppDeliveryStatus =
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type WhatsAppStatusUpdate = {
  messageId: string;
  status: WhatsAppDeliveryStatus;
  timestamp: number;
  errorMessage?: string;
};

const VALID_STATUSES = new Set<WhatsAppDeliveryStatus>([
  "sent",
  "delivered",
  "read",
  "failed",
]);

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const timestamp = Number(value);

  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    return null;
  }

  return timestamp;
}

export function extractWhatsAppStatusUpdates(
  payload: ValidWhatsAppWebhookPayload,
): WhatsAppStatusUpdate[] {
  const updates: WhatsAppStatusUpdate[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const statusUpdate of change.value.statuses ?? []) {
        const messageId = statusUpdate.id?.trim();
        const status = statusUpdate.status;
        const timestamp = parseTimestamp(statusUpdate.timestamp);

        if (
          !messageId ||
          !status ||
          !VALID_STATUSES.has(status as WhatsAppDeliveryStatus) ||
          timestamp === null
        ) {
          continue;
        }

        const errorMessage =
          status === "failed"
            ? statusUpdate.errors?.find(
                (error) => typeof error.message === "string",
              )?.message
            : undefined;

        updates.push({
          messageId,
          status: status as WhatsAppDeliveryStatus,
          timestamp,
          ...(errorMessage ? { errorMessage } : {}),
        });
      }
    }
  }

  return updates;
}

import type { NormalizedEvent } from "../types";

export interface WhatsAppWebhookPayload {
    messageId: string;
    from: string;
    name?: string;
    text?: string;
    timestamp: string;
}

export function normalizeWhatsAppEvent(
    payload: WhatsAppWebhookPayload,
): NormalizedEvent {
    return {
        id: payload.messageId,
        source: "WHATSAPP",
        type: "MESSAGE_RECEIVED",
        occurredAt: new Date(payload.timestamp),

        actor: {
            id: payload.from,
            name: payload.name,
            phone: payload.from,
        },

        conversation: {
            id: payload.from,
        },

        content: {
            type: "TEXT",
            text: payload.text,
        },

        metadata: {},
    };
}
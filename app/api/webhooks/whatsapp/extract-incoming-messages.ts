
import type { WhatsAppWebhookPayload } from "@/app/features/events/gateways/whatsapp";
import type { ValidWhatsAppWebhookPayload } from "./parse-payload.ts";
import { parseWhatsAppTimestamp } from "./validate-timestamp.ts";

export type ExtractedWhatsAppMessage = {
    phoneNumberId: string;
    payload: WhatsAppWebhookPayload;
};

export type ExtractMessagesResult =
    | { success: true; messages: ExtractedWhatsAppMessage[] }
    | { success: false; error: "INVALID_TIMESTAMP" };

export function extractIncomingWhatsAppMessages(
    body: ValidWhatsAppWebhookPayload,
): ExtractMessagesResult {
    const messages: ExtractedWhatsAppMessage[] = [];

    for (const entry of body.entry) {
        for (const change of entry.changes) {
            const value = change.value;
            const phoneNumberId = value.metadata?.phone_number_id?.trim();

            if (!value.messages?.length) {
                continue;
            }

            for (const message of value.messages) {
                if (
                    !phoneNumberId ||
                    !message.id?.trim() ||
                    !message.from?.trim()
                ) {
                    continue;
                }

                const timestamp = parseWhatsAppTimestamp(message.timestamp);

                if (!timestamp) {
                    return { success: false, error: "INVALID_TIMESTAMP" };
                }

                const contact =
                    value.contacts?.find(
                        (item) => item.wa_id === message.from,
                    ) ??
                    (value.contacts?.length === 1
                        ? value.contacts[0]
                        : undefined);

                messages.push({
                    phoneNumberId,
                    payload: {
                        messageId: message.id,
                        from: message.from,
                        name: contact?.profile?.name,
                        text:
                            message.type === "text"
                                ? message.text?.body
                                : undefined,
                        timestamp,
                    },
                });
            }
        }
    }

    return { success: true, messages };
}


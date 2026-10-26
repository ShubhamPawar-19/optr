
export type WhatsAppPayloadParseResult =
    | { success: true; body: unknown }
    | { success: false };

export function parseWhatsAppPayload(
    rawBody: string,
): WhatsAppPayloadParseResult {
    try {
        return {
            success: true,
            body: JSON.parse(rawBody) as unknown,
        };
    } catch {
        return { success: false };
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

export type ValidWhatsAppWebhookPayload = {
    entry: Array<{
        changes: Array<{
            value: {
                metadata?: {
                    phone_number_id?: string;
                };
                messages?: Array<{
                    id?: string;
                    from?: string;
                    type?: string;
                    timestamp?: string;
                    text?: {
                        body?: string;
                    };
                }>;
                statuses?: Array<{
                    id?: string;
                    status?: string;
                    timestamp?: string;
                    errors?: Array<{
                        message?: string;
                    }>;
                }>;
                contacts?: Array<{
                    wa_id?: string;
                    profile?: {
                        name?: string;
                    };
                }>;
            };
        }>;
    }>;
};

export function isWhatsAppWebhookPayload(
    value: unknown,
): value is ValidWhatsAppWebhookPayload {
    if (!isRecord(value) || !isArray(value.entry)) {
        return false;
    }

    return value.entry.every((entry) => {
        if (!isRecord(entry) || !isArray(entry.changes)) {
            return false;
        }

        return entry.changes.every((change) => {
            if (!isRecord(change) || !isRecord(change.value)) {
                return false;
            }

            const payloadValue = change.value;

            if (
                payloadValue.metadata !== undefined &&
                (!isRecord(payloadValue.metadata) ||
                    (payloadValue.metadata.phone_number_id !== undefined &&
                        typeof payloadValue.metadata.phone_number_id !== "string"))
            ) {
                return false;
            }

            if (
                payloadValue.messages !== undefined &&
                (!isArray(payloadValue.messages) ||
                    !payloadValue.messages.every((message) => {
                        if (!isRecord(message)) {
                            return false;
                        }

                        return (
                            (message.id === undefined ||
                                typeof message.id === "string") &&
                            (message.from === undefined ||
                                typeof message.from === "string") &&
                            (message.type === undefined ||
                                typeof message.type === "string") &&
                            (message.timestamp === undefined ||
                                typeof message.timestamp === "string") &&
                            (message.text === undefined ||
                                (isRecord(message.text) &&
                                    (message.text.body === undefined ||
                                        typeof message.text.body === "string")))
                        );
                    }))
            ) {
                return false;
            }

            if (
                payloadValue.statuses !== undefined &&
                (!isArray(payloadValue.statuses) ||
                    !payloadValue.statuses.every((status) => {
                        if (!isRecord(status)) {
                            return false;
                        }

                        return (
                            (status.id === undefined ||
                                typeof status.id === "string") &&
                            (status.status === undefined ||
                                typeof status.status === "string") &&
                            (status.timestamp === undefined ||
                                typeof status.timestamp === "string") &&
                            (status.errors === undefined ||
                                (isArray(status.errors) &&
                                    status.errors.every(
                                        (error) =>
                                            isRecord(error) &&
                                            (error.message === undefined ||
                                                typeof error.message === "string"),
                                    )))
                        );
                    }))
            ) {
                return false;
            }

            if (
                payloadValue.contacts !== undefined &&
                (!isArray(payloadValue.contacts) ||
                    !payloadValue.contacts.every((contact) => {
                        if (!isRecord(contact)) {
                            return false;
                        }

                        return (
                            (contact.wa_id === undefined ||
                                typeof contact.wa_id === "string") &&
                            (contact.profile === undefined ||
                                (isRecord(contact.profile) &&
                                    (contact.profile.name === undefined ||
                                        typeof contact.profile.name === "string")))
                        );
                    }))
            ) {
                return false;
            }

            return true;
        });
    });
}

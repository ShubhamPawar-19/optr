export type EventSource =
    | "GMAIL"
    | "WHATSAPP"
    | "WEBHOOK"
    | "FORM"
    | "INSTAGRAM"
    | "FACEBOOK"
    | "WEBSITE"
    | "CALL";

export type EventContentType =
    | "TEXT"
    | "IMAGE"
    | "AUDIO"
    | "VIDEO"
    | "FILE";

export interface NormalizedEvent {
    id: string;

    source: EventSource;

    type: string;

    occurredAt: Date;

    actor?: {
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
    };

    conversation?: {
        id: string;
    };

    content?: {
        type: EventContentType;
        text?: string;
        url?: string;
    };

    metadata: Record<string, unknown>;
}
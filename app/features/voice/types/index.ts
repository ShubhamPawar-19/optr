export type VoiceProviderName = "RETELL" | "VAPI" | "BOLNA";

export type VoiceCallDirection = "INBOUND" | "OUTBOUND";

export type VoiceCallStatus =
    | "QUEUED"
    | "RINGING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED"
    | "NO_ANSWER"
    | "BUSY"
    | "CANCELED";

export type VoiceWebhookEventType =
    | "CALL_STARTED"
    | "CALL_ENDED"
    | "CALL_ANALYZED"
    | "TRANSCRIPT_UPDATED"
    | "TOOL_CALL"
    | "UNKNOWN";

export interface VoiceToolCall {
    id: string;
    name: string;
    arguments: unknown;
}

export interface VoiceProviderEvent {
    provider: VoiceProviderName;
    providerCallId: string;

    type: VoiceWebhookEventType;
    occurredAt: Date;

    direction?: VoiceCallDirection;
    status?: VoiceCallStatus;

    fromNumber?: string;
    toNumber?: string;

    transcript?: string;
    toolCall?: VoiceToolCall;

    metadata?: Record<string, unknown>;
}
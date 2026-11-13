
import { verify } from "retell-sdk";

import type { VoiceProviderAdapter } from "./types";
import type {
    VoiceCallDirection,
    VoiceCallStatus,
    VoiceProviderEvent,
    VoiceWebhookEventType,
} from "../types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function getString(
    value: unknown,
): string | undefined {
    return typeof value === "string" && value.length > 0
        ? value
        : undefined;
}

function getTimestamp(value: unknown): Date | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? undefined
        : date;
}

function normalizeDirection(
    value: unknown,
): VoiceCallDirection | undefined {
    if (value === "inbound") return "INBOUND";
    if (value === "outbound") return "OUTBOUND";

    return undefined;
}

function normalizeEventType(
    value: unknown,
): VoiceWebhookEventType {
    switch (value) {
        case "call_started":
            return "CALL_STARTED";

        case "call_ended":
            return "CALL_ENDED";

        case "call_analyzed":
            return "CALL_ANALYZED";

        case "transcript_updated":
            return "TRANSCRIPT_UPDATED";

        default:
            return "UNKNOWN";
    }
}

function normalizeStatus(
    eventType: string,
    disconnectionReason: unknown,
): VoiceCallStatus | undefined {
    if (eventType === "call_started") {
        return "IN_PROGRESS";
    }

    if (eventType === "call_ended") {
        if (disconnectionReason === "dial_no_answer") {
            return "NO_ANSWER";
        }

        if (disconnectionReason === "dial_busy") {
            return "BUSY";
        }

        if (disconnectionReason === "dial_failed") {
            return "FAILED";
        }

        return "COMPLETED";
    }

    // Analysis events must not change the call lifecycle status.
    return undefined;
}

export const retellVoiceProvider: VoiceProviderAdapter = {
    name: "RETELL",

    async verifyWebhook({ rawBody, headers }) {
        const apiKey = process.env.RETELL_WEBHOOK_API_KEY;
        const signature = headers.get("x-retell-signature");

        if (!apiKey || !signature) {
            return false;
        }

        try {
            return await verify(rawBody, apiKey, signature);
        } catch {
            return false;
        }
    },

    async parseWebhook(
        payload: unknown,
    ): Promise<VoiceProviderEvent | null> {
        if (!isRecord(payload)) {
            return null;
        }

        const eventName = getString(payload.event);

        if (!eventName || !isRecord(payload.call)) {
            return null;
        }

        const call = payload.call;
        const providerCallId = getString(call.call_id);

        if (!providerCallId) {
            return null;
        }

        const eventType = normalizeEventType(eventName);

        const timestamp =
            eventName === "call_started"
                ? getTimestamp(call.start_timestamp)
                : getTimestamp(call.end_timestamp) ??
                getTimestamp(call.start_timestamp);

        const transcript = getString(call.transcript);

        const metadata: UnknownRecord = {
            retellEvent: eventName,
        };

        if (call.agent_id !== undefined) {
            metadata.agentId = call.agent_id;
        }

        if (call.disconnection_reason !== undefined) {
            metadata.disconnectionReason = call.disconnection_reason;
        }

        if (call.duration_ms !== undefined) {
            metadata.durationMs = call.duration_ms;
        }

        if (call.recording_url !== undefined) {
            metadata.recordingUrl = call.recording_url;
        }

        if (call.call_analysis !== undefined) {
            metadata.callAnalysis = call.call_analysis;
        }

        return {
            provider: "RETELL",
            providerCallId,
            type: eventType,
            occurredAt: timestamp ?? new Date(),
            direction: normalizeDirection(call.direction),
            status: normalizeStatus(
                eventName,
                call.disconnection_reason,
            ),
            fromNumber: getString(call.from_number),
            toNumber: getString(call.to_number),
            transcript,
            metadata,
        };
    },
};

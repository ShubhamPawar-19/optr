
import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";
import { inngest } from "@/app/lib/inngest/client";
import { createCallConversation } from "@/app/features/voice/services/create-call-conversation";
import type {
    VoiceCallDirection,
    VoiceCallStatus,
    VoiceProviderName,
    VoiceWebhookEventType,
} from "@/app/features/voice/types";

function asRecord(
    value: unknown,
): Record<string, unknown> | null {
    if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
    ) {
        return null;
    }

    return value as Record<string, unknown>;
}

function isDirection(value: unknown): value is VoiceCallDirection {
    return value === "INBOUND" || value === "OUTBOUND";
}

function isStatus(value: unknown): value is VoiceCallStatus {
    return [
        "QUEUED",
        "RINGING",
        "IN_PROGRESS",
        "COMPLETED",
        "FAILED",
        "NO_ANSWER",
        "BUSY",
        "CANCELED",
    ].includes(value as string);
}

function isTerminalStatus(status: string): boolean {
    return [
        "COMPLETED",
        "FAILED",
        "NO_ANSWER",
        "BUSY",
        "CANCELED",
    ].includes(status);
}

export const processVoiceCallEvent = inngest.createFunction(
    {
        id: "process-voice-call-event",
        retries: 3,
        concurrency: {
            limit: 1,
            key: "event.data.providerCallId",
        },
        triggers: [
            { event: "optr/voice.call.event.received" },
        ],
    },
    async ({ event, step }) => {
        const eventId = event.data.eventId;

        if (typeof eventId !== "string" || !eventId) {
            throw new Error("Voice event ID is required");
        }

        // Load the original persisted event.
        const normalized = await step.run(
            "load-persisted-voice-event",
            async () => {
                const record = await db.event.findUnique({
                    where: { id: eventId },
                });

                if (!record) {
                    throw new Error(
                        `Persisted voice event not found: ${eventId}`,
                    );
                }

                const metadata = asRecord(record.metadata);
                const storedEvent = asRecord(
                    metadata?.normalizedEvent,
                );

                if (!storedEvent) {
                    throw new Error(
                        "Persisted event has no normalized voice event",
                    );
                }

                return storedEvent;
            },
        );

        const provider = normalized.provider;
        const providerCallId = normalized.providerCallId;
        const type = normalized.type;
        const occurredAt = new Date(
            String(normalized.occurredAt),
        );

        if (
            provider !== "RETELL" &&
            provider !== "VAPI" &&
            provider !== "BOLNA"
        ) {
            throw new Error("Unsupported voice provider");
        }

        if (
            typeof providerCallId !== "string" ||
            !providerCallId
        ) {
            throw new Error("Invalid provider call ID");
        }

        if (Number.isNaN(occurredAt.getTime())) {
            throw new Error("Invalid voice event timestamp");
        }

        const allowedTypes: VoiceWebhookEventType[] = [
            "CALL_STARTED",
            "CALL_ENDED",
            "CALL_ANALYZED",
            "TRANSCRIPT_UPDATED",
            "TOOL_CALL",
            "UNKNOWN",
        ];

        if (!allowedTypes.includes(type as VoiceWebhookEventType)) {
            throw new Error("Invalid voice event type");
        }

        // These event types are not handled by the call lifecycle processor.
        if (type === "UNKNOWN" || type === "TOOL_CALL") {
            return {
                success: true,
                eventId,
                providerCallId,
                eventType: type,
                updated: false,
                skipped: true,
                reason: "Event type is not handled yet",
            };
        }

        const direction = isDirection(normalized.direction)
            ? normalized.direction
            : undefined;

        const status = isStatus(normalized.status)
            ? normalized.status
            : undefined;

        const fromNumber =
            typeof normalized.fromNumber === "string"
                ? normalized.fromNumber
                : undefined;

        const toNumber =
            typeof normalized.toNumber === "string"
                ? normalized.toNumber
                : undefined;

        const transcript =
            typeof normalized.transcript === "string"
                ? normalized.transcript
                : undefined;

        const metadata = asRecord(normalized.metadata) ?? {};

        // Find the call or create it if this is the first event
        // OPTR has received for this provider call.
        const call = await step.run(
            "resolve-call",
            async () => {
                const existing = await db.call.findUnique({
                    where: { providerCallId },
                });

                if (existing) {
                    return existing;
                }

                if (!direction || !toNumber) {
                    throw new Error(
                        "Cannot create call without direction and destination number",
                    );
                }

                const created = await createCallConversation({
                    provider: provider as VoiceProviderName,
                    providerCallId,
                    direction,
                    fromNumber,
                    toNumber,
                    status,
                });

                return created.call;
            },
        );

        // Read the latest database state before applying updates.
        // This protects against duplicate and out-of-order events.
        const result = await step.run(
            "update-call-record",
            async () => {
                const currentCall = await db.call.findUnique({
                    where: { id: call.id },
                });

                if (!currentCall) {
                    throw new Error("Call record not found");
                }

                const updateData: Prisma.CallUpdateInput = {};

                const recordingUrl =
                    typeof metadata.recordingUrl === "string"
                        ? metadata.recordingUrl
                        : undefined;

                const durationMs =
                    typeof metadata.durationMs === "number" &&
                    Number.isSafeInteger(metadata.durationMs) &&
                    metadata.durationMs >= 0
                        ? metadata.durationMs
                        : undefined;

                const callAnalysis = asRecord(
                    metadata.callAnalysis,
                );

                const summary =
                    typeof callAnalysis?.call_summary === "string"
                        ? callAnalysis.call_summary
                        : undefined;

                const outcome =
                    typeof callAnalysis?.call_successful === "boolean"
                        ? callAnalysis.call_successful
                            ? "SUCCESS"
                            : "UNSUCCESSFUL"
                        : undefined;

                if (type === "CALL_STARTED") {
                    // Record the start time once.
                    if (!currentCall.startedAt) {
                        updateData.startedAt = occurredAt;
                    }

                    // A late start event must never reopen a finished call.
                    if (
                        !currentCall.endedAt &&
                        !isTerminalStatus(currentCall.status)
                    ) {
                        updateData.status = "IN_PROGRESS";
                    }
                }

                if (type === "CALL_ENDED") {
                    const isNewerEnd =
                        !currentCall.endedAt ||
                        occurredAt.getTime() >=
                            currentCall.endedAt.getTime();

                    if (isNewerEnd) {
                        updateData.endedAt = occurredAt;

                        if (status) {
                            updateData.status = status;
                        }

                        if (durationMs !== undefined) {
                            updateData.durationMs = durationMs;
                        }
                    }
                }

                if (
                    type === "CALL_ANALYZED" ||
                    type === "TRANSCRIPT_UPDATED"
                ) {
                    if (transcript !== undefined) {
                        updateData.transcript = transcript;
                    }

                    if (summary !== undefined) {
                        updateData.summary = summary;
                    }

                    if (outcome !== undefined) {
                        updateData.outcome = outcome;
                    }
                }

                if (recordingUrl !== undefined) {
                    updateData.recordingUrl = recordingUrl;
                }

                if (Object.keys(metadata).length > 0) {
                    const existingMetadata =
                        asRecord(currentCall.metadata) ?? {};

                    updateData.metadata = {
                        ...existingMetadata,
                        ...metadata,
                    } as Prisma.InputJsonValue;
                }

                if (Object.keys(updateData).length === 0) {
                    return { updated: false };
                }

                await db.call.update({
                    where: { id: currentCall.id },
                    data: updateData,
                });

                return { updated: true };
            },
        );

        return {
            success: true,
            eventId,
            providerCallId,
            eventType: type,
            updated: result.updated,
        };
    },
);

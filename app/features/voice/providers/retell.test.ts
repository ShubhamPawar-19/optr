
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { retellVoiceProvider } from "./retell";

describe("Retell webhook adapter", () => {
    it("normalizes call_started events", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "call_started",
            call: {
                call_id: "call_123",
                direction: "inbound",
                from_number: "+919876543210",
                to_number: "+971501234567",
                start_timestamp: 1793900000000,
            },
        });

        assert.ok(event);
        assert.equal(event.provider, "RETELL");
        assert.equal(event.providerCallId, "call_123");
        assert.equal(event.type, "CALL_STARTED");
        assert.equal(event.direction, "INBOUND");
        assert.equal(event.status, "IN_PROGRESS");
        assert.equal(
            event.fromNumber,
            "+919876543210",
        );
        assert.equal(
            event.toNumber,
            "+971501234567",
        );
        assert.equal(
            event.occurredAt.getTime(),
            1793900000000,
        );
    });

    it("normalizes call_ended events", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "call_ended",
            call: {
                call_id: "call_123",
                end_timestamp: 1793900060000,
                disconnection_reason: "dial_no_answer",
            },
        });

        assert.ok(event);
        assert.equal(event.type, "CALL_ENDED");
        assert.equal(event.status, "NO_ANSWER");
    });

    it("maps failed calls correctly", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "call_ended",
            call: {
                call_id: "call_456",
                disconnection_reason: "dial_failed",
            },
        });

        assert.ok(event);
        assert.equal(event.status, "FAILED");
    });

    it("does not change call status for call_analyzed events", async () => {
        const analysis = {
            call_summary: "Customer asked about a property.",
            user_sentiment: "Positive",
        };

        const event = await retellVoiceProvider.parseWebhook({
            event: "call_analyzed",
            call: {
                call_id: "call_123",
                transcript: "Hello, I am interested in a property.",
                call_analysis: analysis,
                duration_ms: 45000,
                recording_url: "https://example.com/recording",
            },
        });

        assert.ok(event);
        assert.equal(event.type, "CALL_ANALYZED");
        assert.equal(event.status, undefined);
        assert.equal(
            event.transcript,
            "Hello, I am interested in a property.",
        );
        assert.ok(event.metadata);
        assert.deepEqual(event.metadata.callAnalysis, analysis);
        assert.equal(event.metadata.durationMs, 45000);
    });

    it("uses start_timestamp when end_timestamp is unavailable", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "transcript_updated",
            call: {
                call_id: "call_123",
                start_timestamp: 1793900000000,
            },
        });

        assert.ok(event);
        assert.equal(
            event.occurredAt.getTime(),
            1793900000000,
        );
    });

    it("handles missing timestamps safely", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "call_started",
            call: {
                call_id: "call_123",
            },
        });

        assert.ok(event);
        assert.ok(event.occurredAt instanceof Date);
        assert.ok(Number.isFinite(event.occurredAt.getTime()));
    });

    it("normalizes unknown event names safely", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "some_future_retell_event",
            call: {
                call_id: "call_123",
            },
        });

        assert.ok(event);
        assert.equal(event.type, "UNKNOWN");
        assert.equal(event.status, undefined);
    });

    it("rejects payloads without a call ID", async () => {
        const event = await retellVoiceProvider.parseWebhook({
            event: "call_started",
            call: {
                direction: "inbound",
            },
        });

        assert.equal(event, null);
    });

    it("rejects invalid payload structures", async () => {
        assert.equal(
            await retellVoiceProvider.parseWebhook(null),
            null,
        );

        assert.equal(
            await retellVoiceProvider.parseWebhook({
                event: "call_started",
            }),
            null,
        );
    });
});

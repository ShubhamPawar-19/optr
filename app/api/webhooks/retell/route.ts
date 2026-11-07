
import { NextRequest, NextResponse } from "next/server";

import { inngest } from "@/app/lib/inngest/client";
import { persistCallEvent } from "@/app/features/voice/services/persist-call-event";
import { registerVoiceProviders } from "@/app/features/voice/providers/register";
import { getVoiceProvider } from "@/app/features/voice/providers/registry";

export async function POST(request: NextRequest) {
    registerVoiceProviders();

    const provider = getVoiceProvider("RETELL");

    if (!provider) {
        console.error("[retell-webhook] Retell provider not registered");

        return NextResponse.json(
            { error: "Voice provider unavailable" },
            { status: 500 },
        );
    }

    // Read the original body because signature verification requires
    // the exact raw request body.
    const rawBody = await request.text();

    // Verify the signature before trusting the payload.
    const isValid = await provider.verifyWebhook({
        rawBody,
        headers: request.headers,
    });

    if (!isValid) {
        console.error("[retell-webhook] Signature verification failed");

        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 401 },
        );
    }

    let payload: unknown;

    try {
        payload = JSON.parse(rawBody);
    } catch {
        console.error("[retell-webhook] Invalid JSON payload");

        return NextResponse.json(
            { error: "Invalid JSON payload" },
            { status: 400 },
        );
    }

    let event;

    try {
        event = await provider.parseWebhook(payload);
    } catch (error) {
        console.error("[retell-webhook] Event parsing failed", error);

        return NextResponse.json(
            { error: "Unable to parse webhook event" },
            { status: 400 },
        );
    }

    if (!event) {
        console.error("[retell-webhook] Invalid event payload");

        return NextResponse.json(
            { error: "Invalid webhook payload" },
            { status: 400 },
        );
    }

    try {
        // Persist the normalized event before dispatching it.
        // Identical webhook deliveries produce the same event ID.
        const persisted = await persistCallEvent({
            event,
            rawBody,
            payload,
        });

        // Always dispatch, including duplicate deliveries.
        // If a previous dispatch failed after persistence, a Retell
        // retry can dispatch the already-persisted event again.
        await inngest.send({
            name: "optr/voice.call.event.received",
            data: {
                eventId: persisted.eventId,
                providerCallId: event.providerCallId,
            },
        });

        console.info("[retell-webhook] Event queued", {
            eventId: persisted.eventId,
            eventType: event.type,
            duplicate: persisted.duplicate,
        });

        return NextResponse.json({
            success: true,
            received: true,
            queued: true,
            duplicate: persisted.duplicate,
            event: event.type,
        });
    } catch (error) {
        console.error("[retell-webhook] Persistence or dispatch failed", {
            eventType: event.type,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });

        // Returning 500 allows Retell to retry the webhook.
        return NextResponse.json(
            { error: "Failed to process webhook event" },
            { status: 500 },
        );
    }
}

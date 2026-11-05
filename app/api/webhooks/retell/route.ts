
import { NextRequest, NextResponse } from "next/server";

import { registerVoiceProviders } from "@/app/features/voice/providers/register";
import { getVoiceProvider } from "@/app/features/voice/providers/registry";

export async function POST(request: NextRequest) {
    // Register providers before looking up the Retell adapter.
    registerVoiceProviders();

    const provider = getVoiceProvider("RETELL");

    if (!provider) {
        console.error("[retell-webhook] Retell provider not registered");

        return NextResponse.json(
            { error: "Voice provider unavailable" },
            { status: 500 },
        );
    }

    // Read the original body. Signature verification requires the exact
    // raw body, not JSON that has been parsed and serialized again.
    const rawBody = await request.text();

    // Verify the request before trusting or parsing its contents.
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

    const event = await provider.parseWebhook(payload);

    if (!event) {
        console.error("[retell-webhook] Invalid event payload");

        return NextResponse.json(
            { error: "Invalid webhook payload" },
            { status: 400 },
        );
    }

    // Temporary acknowledgement. Persistence and event processing
    // will be implemented in the next steps.
    console.info("[retell-webhook] Event received", {
        type: event.type,
        providerCallId: event.providerCallId,
    });

    return NextResponse.json({
        success: true,
        received: true,
        event: event.type,
    });
}

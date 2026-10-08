import { NextRequest, NextResponse } from "next/server";
import {
    normalizeWhatsAppEvent,
    type WhatsAppWebhookPayload,
} from "@/app/features/events/gateways/whatsapp";
import { resolveAgentForWhatsApp } from "@/app/features/agents/resolve-agent";
import { processAgentEvent } from "@/app/features/agents/service";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN &&
        challenge
    ) {
        return new NextResponse(challenge, {
            status: 200,
        });
    }

    return NextResponse.json(
        {
            error: "Verification failed",
        },
        {
            status: 403,
        },
    );
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    console.log("WhatsApp webhook received:", body);

    // Temporary normalized payload for local testing.
    // Meta payload parsing will be added next.
    const payload: WhatsAppWebhookPayload = {
        messageId: crypto.randomUUID(),
        from: "919999999999",
        name: "Test User",
        text: body.text ?? "Hello from WhatsApp",
        timestamp: new Date().toISOString(),
    };

    const event = normalizeWhatsAppEvent(payload);

    const agent = resolveAgentForWhatsApp();

    const { conversation, result } =
        await processAgentEvent({
            agent,
            event,
            userId: "test-user",
        });

    return NextResponse.json({
        success: true,
        event,
        conversation,
        run: result.run,
        steps: result.steps,
    });
}
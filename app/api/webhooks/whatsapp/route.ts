import { NextRequest, NextResponse } from "next/server";
import type { WhatsAppWebhookPayload } from "@/app/features/events/gateways/whatsapp";
import { resolveWhatsAppBusiness } from "@/app/features/agents/resolve-whatsapp-business";
import { verifyWhatsAppSignature } from "@/app/features/events/gateways/whatsapp/verify-signature";
import { inngest } from "@/app/lib/inngest/client";
import {
    isWhatsAppWebhookPayload,
    parseWhatsAppPayload,
} from "./parse-payload";
import { parseWhatsAppTimestamp } from "./validate-timestamp";

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
        { error: "Verification failed" },
        { status: 403 },
    );
}

export async function POST(request: NextRequest) {
    const signature = request.headers.get("x-hub-signature-256");
    const rawBody = await request.text();

    if (!verifyWhatsAppSignature(rawBody, signature)) {
        console.error("WhatsApp webhook signature verification failed");

        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 401 },
        );
    }

    const parsed = parseWhatsAppPayload(rawBody);

    if (!parsed.success) {
        console.error("WhatsApp webhook received malformed JSON");

        return NextResponse.json(
            { error: "Invalid JSON payload" },
            { status: 400 },
        );
    }

    if (!isWhatsAppWebhookPayload(parsed.body)) {
        console.error("WhatsApp webhook received an invalid payload structure");

        return NextResponse.json(
            { error: "Invalid webhook payload structure" },
            { status: 400 },
        );
    }

    const body = parsed.body;
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const phoneNumberId = value?.metadata?.phone_number_id;
    const message = value?.messages?.[0];

    console.log("WhatsApp webhook received:", {
        phoneNumberId,
        hasMessage: Boolean(message?.id),
        messageType: message?.type,
        from: message?.from,
    });

    // Ignore status updates and payloads without an incoming message.
    if (
        !phoneNumberId?.trim() ||
        !message?.id?.trim() ||
        !message?.from?.trim()
    ) {
        return NextResponse.json({
            success: true,
            ignored: true,
        });
    }

    const timestamp = parseWhatsAppTimestamp(message.timestamp);

    if (!timestamp) {
        console.error("WhatsApp webhook received an invalid message timestamp");

        return NextResponse.json(
            { error: "Invalid message timestamp" },
            { status: 400 },
        );
    }

    const businessId = await resolveWhatsAppBusiness(phoneNumberId);

    if (!businessId) {
        console.error("Unmapped or inactive WhatsApp channel:", phoneNumberId);

        return NextResponse.json(
            { error: "WhatsApp channel not configured" },
            { status: 404 },
        );
    }

    const payload: WhatsAppWebhookPayload = {
        messageId: message.id,
        from: message.from,
        name: value?.contacts?.[0]?.profile?.name,
        text: message.type === "text" ? message.text?.body : undefined,
        timestamp,
    };

    try {
        await inngest.send({
            name: "optr/whatsapp.message.received",
            data: {
                phoneNumberId,
                messageId: payload.messageId,
                from: payload.from,
                name: payload.name,
                text: payload.text,
                timestamp: payload.timestamp,
            },
        });
    } catch (error) {
        console.error("Failed to enqueue WhatsApp message:", error);

        return NextResponse.json(
            { error: "Failed to queue message for processing" },
            { status: 500 },
        );
    }

    return NextResponse.json({
        success: true,
        queued: true,
    });
}
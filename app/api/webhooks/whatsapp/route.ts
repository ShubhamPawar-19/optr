import { NextRequest, NextResponse } from "next/server";
import { resolveWhatsAppBusiness } from "@/app/features/agents/resolve-whatsapp-business";
import { verifyWhatsAppSignature } from "@/app/features/events/gateways/whatsapp/verify-signature";
import {
    savePendingWhatsAppStatus,
    updateOutboundMessageFromWhatsAppStatus,
} from "@/app/features/conversations/service";
import { inngest } from "@/app/lib/inngest/client";
import {
    isWhatsAppWebhookPayload,
    parseWhatsAppPayload,
} from "./parse-payload";
import { extractIncomingWhatsAppMessages } from "./extract-incoming-messages";
import { extractWhatsAppStatusUpdates } from "./extract-status-updates";

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
        return new NextResponse(challenge, { status: 200 });
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

    const extracted = extractIncomingWhatsAppMessages(parsed.body);

    if (!extracted.success) {
        console.error("WhatsApp webhook received an invalid message timestamp");
        return NextResponse.json(
            { error: "Invalid message timestamp" },
            { status: 400 },
        );
    }

    const incomingMessages = extracted.messages;
    const statusUpdates = extractWhatsAppStatusUpdates(parsed.body);

    // Resolve every referenced channel before performing any side effects.
    const phoneNumberIds = new Set<string>();

    for (const message of incomingMessages) {
        phoneNumberIds.add(message.phoneNumberId);
    }

    for (const statusUpdate of statusUpdates) {
        phoneNumberIds.add(statusUpdate.phoneNumberId);
    }

    const businessIds = new Map<string, string>();

    try {
        for (const phoneNumberId of phoneNumberIds) {
            const businessId =
                await resolveWhatsAppBusiness(phoneNumberId);

            if (!businessId) {
                console.error(
                    "[whatsapp-webhook] Unmapped or inactive WhatsApp channel",
                );

                return NextResponse.json(
                    { error: "WhatsApp channel not configured" },
                    { status: 404 },
                );
            }

            businessIds.set(phoneNumberId, businessId);
        }
    } catch (error) {
        console.error(
            "[whatsapp-webhook] Failed to resolve WhatsApp channels:",
            error,
        );

        return NextResponse.json(
            { error: "Failed to validate WhatsApp channels" },
            { status: 500 },
        );
    }

    let updatedStatuses = 0;
    let pendingStatuses = 0;
    let ignoredStatuses = 0;

    try {
        // Delivery callbacks update persisted messages only.
        // They never invoke the agent.
        for (const statusUpdate of statusUpdates) {
            const businessId = businessIds.get(
                statusUpdate.phoneNumberId,
            );

            // Defensive guard: every referenced channel should have been
            // resolved successfully above.
            if (!businessId) {
                console.error(
                    "[whatsapp-webhook] Channel resolution invariant failed",
                );

                return NextResponse.json(
                    { error: "WhatsApp channel validation failed" },
                    { status: 500 },
                );
            }

            const result =
                await updateOutboundMessageFromWhatsAppStatus({
                    phoneNumberId: statusUpdate.phoneNumberId,
                    businessId,
                    externalId: statusUpdate.messageId,
                    status: statusUpdate.status,
                    timestamp: statusUpdate.timestamp,
                    error: statusUpdate.errorMessage,
                });

            if (result.updated) {
                updatedStatuses += 1;
            } else if (result.reason === "message-not-found") {
                await savePendingWhatsAppStatus({
                    phoneNumberId: statusUpdate.phoneNumberId,
                    externalId: statusUpdate.messageId,
                    status: statusUpdate.status,
                    timestamp: statusUpdate.timestamp,
                    error: statusUpdate.errorMessage,
                });

                pendingStatuses += 1;
            } else {
                ignoredStatuses += 1;
            }
        }

        // Queue incoming messages only after channel validation succeeds.
        for (const { phoneNumberId, payload } of incomingMessages) {
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
        }
    } catch (error) {
        console.error("Failed to process WhatsApp webhook:", error);

        return NextResponse.json(
            { error: "Failed to process WhatsApp webhook" },
            { status: 500 },
        );
    }

    return NextResponse.json({
        success: true,
        queued: incomingMessages.length,
        updatedStatuses,
        pendingStatuses,
        ignoredStatuses,
    });
}
import { NextRequest, NextResponse } from "next/server";
import {
    normalizeWhatsAppEvent,
    type WhatsAppWebhookPayload,
} from "@/app/features/events/gateways/whatsapp";
import { resolveAgentForWhatsApp } from "@/app/features/agents/resolve-agent";
import { processAgentEvent } from "@/app/features/agents/service";
import { resolveWhatsAppBusiness } from "@/app/features/agents/resolve-whatsapp-business";
import { sendWhatsAppMessage } from "@/app/features/events/gateways/whatsapp/send-message";
import { verifyWhatsAppSignature } from "@/app/features/events/gateways/whatsapp/verify-signature";

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
    const signature = request.headers.get("x-hub-signature-256");
    const rawBody = await request.text();

    if (!verifyWhatsAppSignature(rawBody, signature)) {
        console.error("WhatsApp webhook signature verification failed");
        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 401 },
        );
    }

    const body = JSON.parse(rawBody);

    const phoneNumberId =
        body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    console.log("WhatsApp webhook received:", {
        phoneNumberId,
        hasMessage: Boolean(message?.id),
        messageType: message?.type,
        from: message?.from,
    });
    // Ignore webhook events that do not contain an incoming message.
    if (!phoneNumberId || !message?.id || !message?.from) {
        return NextResponse.json({ success: true, ignored: true });
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
        name: body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name,
        text: message.type === "text" ? message.text?.body : undefined,
        timestamp: new Date(Number(message.timestamp) * 1000).toISOString(),
    };

    const event = normalizeWhatsAppEvent(payload);
    const agent = await resolveAgentForWhatsApp(businessId);

    console.time("WhatsApp processAgentEvent");

    const { conversation, result } = await processAgentEvent({
        agent,
        event,
        userId: message.from,
    });

    if (!conversation) {
        console.error("WhatsApp agent run returned no conversation");
        return NextResponse.json(
            { error: "Conversation was not created" },
            { status: 500 },
        );
    }

    console.timeEnd("WhatsApp processAgentEvent");

    console.log("WhatsApp agent run completed:", {
        conversationId: conversation.id,
        runId: result.run.id,
        stepsCount: result.steps.length,
    });
    const finalStep = [...result.steps].reverse().find((step) => {
        const output: unknown = step.output;

        return (
            step.status === "SUCCEEDED" &&
            typeof output === "object" &&
            output !== null &&
            "type" in output &&
            output.type === "FINAL" &&
            "response" in output &&
            typeof output.response === "string"
        );
    });

    const reply =
        finalStep &&
        typeof finalStep.output === "object" &&
        finalStep.output !== null &&
        "response" in finalStep.output &&
        typeof finalStep.output.response === "string"
            ? finalStep.output.response
            : undefined;

    console.log("Final WhatsApp reply found:", {
        hasReply: typeof reply === "string" && reply.trim().length > 0,
        replyLength: typeof reply === "string" ? reply.length : 0,
    });

    if (typeof reply === "string" && reply.trim()) {
        try {
            const sendResult = await sendWhatsAppMessage({
                to: message.from,
                text: reply,
            });

            console.log("WhatsApp reply sent:", sendResult);
        } catch (error) {
            console.error("WhatsApp send failed:", error);
        }
    } else {
        console.warn("No final text response found for WhatsApp reply");
    }

    console.dir(
        {
            runStatus: result.run.status,
            steps: result.steps.map((step) => ({
                status: step.status,
                output: step.output,
            })),
        },
        { depth: null },
    );
    return NextResponse.json({
        success: true,
        event,
        conversation,
        run: result.run,
        steps: result.steps,
    });
}

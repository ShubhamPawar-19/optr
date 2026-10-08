import { NextRequest, NextResponse } from "next/server";
import {
    normalizeWhatsAppEvent,
    type WhatsAppWebhookPayload,
} from "@/app/features/events/gateways/whatsapp";
import { resolveAgentForWhatsApp } from "@/app/features/agents/resolve-agent";
import { createAgentRun } from "@/app/features/runtime/create-run";
import { runAgent } from "@/app/features/runtime/run-agent";
import { VercelAIProvider } from "@/app/features/runtime/llm-provider";
import {
    getOrCreateConversation,
    createMessage,
} from "@/app/features/conversations/service";

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

    const conversation = await getOrCreateConversation({
        agentId: agent.id,
        channel: "WHATSAPP",
        externalId: event.conversation!.id,
    });

    await createMessage({
        conversationId: conversation.id,
        role: "USER",
        content: event.content?.text ?? "",
        externalId: event.id,
    });

    const runtimeContext = createAgentRun(
        agent,
        event,
        conversation.id,
    );

    const provider = new VercelAIProvider(
        agent.model,
    );

    const result = await runAgent(
        provider,
        runtimeContext,
        "test-user",
    );

    if (result.run.status === "COMPLETED") {
        const finalStep = [...result.steps]
            .reverse()
            .find(
                (step) =>
                    step.type === "LLM" &&
                    typeof step.output === "object" &&
                    step.output !== null &&
                    "type" in step.output &&
                    step.output.type === "FINAL" &&
                    "response" in step.output &&
                    typeof step.output.response === "string",
            );

            if (
    finalStep &&
    typeof finalStep.output === "object" &&
    finalStep.output !== null &&
    "response" in finalStep.output &&
    typeof finalStep.output.response === "string"
) {
    await createMessage({
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: finalStep.output.response,
    });
}
        
    }

    return NextResponse.json({
        success: true,
        event,
        run: result.run,
        steps: result.steps,
    });
}
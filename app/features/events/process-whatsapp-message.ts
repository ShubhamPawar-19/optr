import { inngest } from "@/app/lib/inngest/client";
import { resolveWhatsAppBusiness } from "@/app/features/agents/resolve-whatsapp-business";
import { resolveAgentForWhatsApp } from "@/app/features/agents/resolve-agent";
import { processAgentEvent } from "@/app/features/agents/service";
import { sendWhatsAppMessage } from "@/app/features/events/gateways/whatsapp/send-message";
import { normalizeWhatsAppEvent } from "@/app/features/events/gateways/whatsapp";
import {
    claimOutboundMessage,
    reconcilePendingWhatsAppStatuses,
    updateOutboundMessage,
} from "@/app/features/conversations/service";

export const processWhatsAppMessage = inngest.createFunction(
    {
        id: "process-whatsapp-message",
        retries: 3,
        triggers: [{ event: "optr/whatsapp.message.received" }],
    },
    async ({ event, step }) => {
        const payload = event.data;

        const businessId = await step.run("resolve-business", async () => {
            const resolvedBusinessId = await resolveWhatsAppBusiness(
                payload.phoneNumberId,
            );

            if (!resolvedBusinessId) {
                throw new Error(
                    "WhatsApp channel is not configured or active",
                );
            }

            return resolvedBusinessId;
        });

        const agent = await step.run("resolve-agent", async () => {
            return resolveAgentForWhatsApp(businessId);
        });

        const normalizedEvent = normalizeWhatsAppEvent({
            messageId: payload.messageId,
            from: payload.from,
            name: payload.name,
            text: payload.text,
            timestamp: payload.timestamp,
        });

        const result = await step.run("process-agent-event", async () => {
            const processed = await processAgentEvent({
                agent,
                event: normalizedEvent,
                userId: payload.from,
            });

            if (processed.duplicate) {
                return {
                    duplicate: true,
                    reply: null,
                    assistantMessageId: null,
                };
            }

            const finalStep = [...(processed.result?.steps ?? [])]
                .reverse()
                .find((item) => {
                    const output: unknown = item.output;

                    return (
                        item.status === "SUCCEEDED" &&
                        typeof output === "object" &&
                        output !== null &&
                        "type" in output &&
                        output.type === "FINAL" &&
                        "response" in output &&
                        typeof output.response === "string"
                    );
                });

            const output: unknown = finalStep?.output;
            const reply =
                typeof output === "object" &&
                output !== null &&
                "response" in output &&
                typeof output.response === "string"
                    ? output.response
                    : null;

            return {
                duplicate: false,
                reply,
                assistantMessageId: processed.assistantMessageId,
            };
        });

        if (
            result.duplicate ||
            !result.reply?.trim() ||
            !result.assistantMessageId
        ) {
            return {
                duplicate: result.duplicate,
                sent: false,
            };
        }

        const sendResult = await step.run("send-whatsapp-reply", async () => {
            const claimed = await claimOutboundMessage(
                result.assistantMessageId!,
            );

            if (!claimed) {
                return { sent: false, reason: "not-claimable" as const };
            }

            try {
                const response = await sendWhatsAppMessage({
                    to: payload.from,
                    text: result.reply!,
                });

                const externalId = response.messages[0].id;

                await updateOutboundMessage({
                    messageId: result.assistantMessageId!,
                    status: "SENT",
                    externalId,
                });

                await reconcilePendingWhatsAppStatuses(externalId);

                return { sent: true as const };
            } catch (error) {
                try {
                    await updateOutboundMessage({
                        messageId: result.assistantMessageId!,
                        status: "UNKNOWN",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unknown WhatsApp send outcome",
                    });
                } catch (persistenceError) {
                    console.error(
                        "[whatsapp-outbound] Failed to persist uncertain send",
                        persistenceError,
                    );
                }

                throw error;
            }
        });

        return {
            duplicate: false,
            sent: sendResult.sent,
            ...(sendResult.sent
                ? {}
                : { reason: sendResult.reason }),
        };
    },
);

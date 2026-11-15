
import { db } from "@/app/lib/db";
import type {
    VoiceCallDirection,
    VoiceCallStatus,
    VoiceProviderName,
} from "../types";
import { resolveVoiceChannel } from "./resolve-voice-channel";

type CreateCallConversationParams = {
    provider: VoiceProviderName;
    providerCallId: string;
    callType: "PHONE" | "WEB";
    direction?: VoiceCallDirection;
    fromNumber?: string;
    toNumber?: string;
    providerAgentId?: string;
    status?: VoiceCallStatus;
    callerName?: string;
};

export async function createCallConversation(
    params: CreateCallConversationParams,
) {
    if (!params.providerCallId.trim()) {
        throw new Error("Provider call ID is required");
    }

    // Phone calls require direction and a destination number.
    if (params.callType === "PHONE") {
        if (!params.direction) {
            throw new Error("Phone calls require a direction");
        }

        if (!params.toNumber?.trim()) {
            throw new Error("Phone calls require a destination number");
        }

        if (!/^\+[1-9]\d{7,14}$/.test(params.toNumber.trim())) {
            throw new Error("Invalid destination phone number");
        }
    }

    // Web calls must resolve through the provider's agent ID.
    if (
        params.callType === "WEB" &&
        !params.providerAgentId?.trim()
    ) {
        throw new Error("Web calls require a provider agent ID");
    }

    const resolved =
        params.callType === "PHONE"
            ? await resolveVoiceChannel({
                  callType: "PHONE",
                  toNumber: params.toNumber!,
                  provider: params.provider,
              })
            : await resolveVoiceChannel({
                  callType: "WEB",
                  providerAgentId: params.providerAgentId!,
                  provider: params.provider,
              });

    // Only phone calls can create a caller identity.
    const callerNumber = params.fromNumber?.trim() ?? "";

    const isValidCallerNumber =
        params.callType === "PHONE" &&
        /^\+[1-9]\d{7,14}$/.test(callerNumber);

    return db.$transaction(async (tx) => {
        let contactId: string | undefined;

        if (isValidCallerNumber) {
            const identity = await tx.contactIdentity.upsert({
                where: {
                    businessId_channel_externalId: {
                        businessId: resolved.businessId,
                        channel: "PHONE",
                        externalId: callerNumber,
                    },
                },
                update: {},
                create: {
                    channel: "PHONE",
                    externalId: callerNumber,
                    business: {
                        connect: {
                            id: resolved.businessId,
                        },
                    },
                    contact: {
                        create: {
                            name: params.callerName?.trim() || null,
                            phone: callerNumber,
                            business: {
                                connect: {
                                    id: resolved.businessId,
                                },
                            },
                        },
                    },
                },
                include: {
                    contact: true,
                },
            });

            contactId = identity.contact.id;

            // Fill missing contact details without overwriting existing data.
            await tx.contact.updateMany({
                where: {
                    id: contactId,
                    name: null,
                },
                data: {
                    name: params.callerName?.trim() || undefined,
                },
            });

            await tx.contact.updateMany({
                where: {
                    id: contactId,
                    phone: null,
                },
                data: {
                    phone: callerNumber,
                },
            });
        }

        const conversation = await tx.conversation.upsert({
            where: {
                agentId_channel_externalId: {
                    agentId: resolved.agent.id,
                    channel: "CALL",
                    externalId: params.providerCallId,
                },
            },
            update: contactId
                ? { contactId }
                : {},
            create: {
                id: crypto.randomUUID(),
                agentId: resolved.agent.id,
                channel: "CALL",
                externalId: params.providerCallId,
                contactId,
            },
        });

        const call = await tx.call.upsert({
            where: {
                providerCallId: params.providerCallId,
            },
            update: {},
            create: {
                id: crypto.randomUUID(),
                conversationId: conversation.id,
                voiceChannelId: resolved.voiceChannel.id,
                provider: params.provider,
                providerCallId: params.providerCallId,
                callType: params.callType,
                direction: params.direction ?? null,
                status: params.status ?? "QUEUED",
                fromNumber: params.fromNumber ?? null,
                toNumber: params.toNumber ?? null,
            },
        });

        // Never associate an existing provider call with another channel.
        if (
            call.voiceChannelId !== resolved.voiceChannel.id ||
            call.conversationId !== conversation.id ||
            call.provider !== params.provider ||
            call.callType !== params.callType
        ) {
            throw new Error(
                "Provider call ID is already associated with another voice channel",
            );
        }

        return {
            call,
            conversation,
            contactId: contactId ?? null,
            agent: resolved.agent,
            businessId: resolved.businessId,
        };
    });
}

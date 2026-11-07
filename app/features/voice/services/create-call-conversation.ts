
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
    direction: VoiceCallDirection;
    fromNumber?: string;
    toNumber: string;
    status?: VoiceCallStatus;
    callerName?: string;
};

export async function createCallConversation(
    params: CreateCallConversationParams,
) {
    if (!params.providerCallId.trim()) {
        throw new Error("Provider call ID is required");
    }

    // Resolve the business and OPTR agent from the destination number.
    const resolved = await resolveVoiceChannel({
        toNumber: params.toNumber,
        provider: params.provider,
    });

    // Only create a caller identity for valid E.164 numbers.
    const callerNumber = params.fromNumber?.trim() ?? "";

    const isValidCallerNumber =
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
                direction: params.direction,
                status: params.status ?? "QUEUED",
                fromNumber: params.fromNumber ?? null,
                toNumber: params.toNumber,
            },
        });

        // Never associate an existing provider call with another channel.
        if (
            call.voiceChannelId !== resolved.voiceChannel.id ||
            call.conversationId !== conversation.id ||
            call.provider !== params.provider
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

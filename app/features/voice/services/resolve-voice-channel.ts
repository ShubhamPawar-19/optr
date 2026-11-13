
import { db } from "@/app/lib/db";
import type { VoiceProviderName } from "../types";

type ResolveVoiceChannelParams = {
    toNumber: string;
    provider: VoiceProviderName;
};

export async function resolveVoiceChannel(
    params: ResolveVoiceChannelParams,
) {
    const phoneNumber = params.toNumber.trim();

    // Voice numbers must be stored in E.164 format.
    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
        throw new Error("Invalid destination phone number");
    }

    const voiceChannel = await db.voiceChannel.findUnique({
        where: {
            phoneNumber,
        },
        include: {
            agent: true,
        },
    });

    if (!voiceChannel) {
        throw new Error("Voice channel not found");
    }

    if (!voiceChannel.isActive) {
        throw new Error("Voice channel is inactive");
    }

    if (voiceChannel.provider !== params.provider) {
        throw new Error("Voice provider mismatch");
    }

    if (!voiceChannel.agent.isActive) {
        throw new Error("Assigned agent is inactive");
    }

    if (voiceChannel.agent.businessId !== voiceChannel.businessId) {
        throw new Error(
            "Voice channel and assigned agent belong to different businesses",
        );
    }

    return {
        voiceChannel,
        agent: voiceChannel.agent,
        businessId: voiceChannel.businessId,
    };
}

import { db } from "@/app/lib/db";
import type { VoiceProviderName } from "../types";

type ResolveVoiceChannelParams =
    | {
          callType: "PHONE";
          toNumber: string;
          provider: VoiceProviderName;
      }
    | {
          callType: "WEB";
          providerAgentId: string;
          provider: VoiceProviderName;
      };

export async function resolveVoiceChannel(
    params: ResolveVoiceChannelParams,
) {
    const voiceChannel =
        params.callType === "PHONE"
            ? await db.voiceChannel.findUnique({
                  where: {
                      phoneNumber: params.toNumber.trim(),
                  },
                  include: {
                      agent: true,
                  },
              })
            : await db.voiceChannel.findUnique({
                  where: {
                      provider_providerAgentId: {
                          provider: params.provider,
                          providerAgentId: params.providerAgentId.trim(),
                      },
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

    if (
        params.callType === "PHONE" &&
        voiceChannel.phoneNumber !== params.toNumber.trim()
    ) {
        throw new Error("Voice channel phone number mismatch");
    }

    if (
        params.callType === "WEB" &&
        voiceChannel.providerAgentId !== params.providerAgentId.trim()
    ) {
        throw new Error("Voice provider agent mismatch");
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
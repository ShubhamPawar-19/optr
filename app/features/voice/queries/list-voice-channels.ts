import "server-only";

import { db } from "@/app/lib/db";
import { requireCurrentBusiness } from "@/app/lib/current-business";

export async function listVoiceChannels() {
    const business = await requireCurrentBusiness();

    const channels = await db.voiceChannel.findMany({
        where: {
            businessId: business.id,
        },
        include: {
            agent: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return channels.map((channel) => ({
        id: channel.id,
        provider: channel.provider,
        providerAgentId: channel.providerAgentId,
        phoneNumber: channel.phoneNumber,
        isActive: channel.isActive,
        createdAt: channel.createdAt.toISOString(),
        updatedAt: channel.updatedAt.toISOString(),
        agent: channel.agent,
    }));
}
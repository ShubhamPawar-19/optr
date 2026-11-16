"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/app/lib/db";
import { requireCurrentBusiness } from "@/app/lib/current-business";

const createVoiceChannelSchema = z.object({
    callType: z.enum(["PHONE", "WEB"]),
    providerAgentId: z.string().trim().min(1).max(200),
    phoneNumber: z.string().trim().optional(),
    agentId: z.string().trim().min(1).max(100),
});

const activationSchema = z.object({
    channelId: z.string().trim().min(1).max(100),
    active: z.enum(["true", "false"]),
});

function getString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
}

export async function createVoiceChannel(formData: FormData) {
    const business = await requireCurrentBusiness();

    const parsed = createVoiceChannelSchema.safeParse({
        callType: getString(formData, "callType"),
        providerAgentId: getString(formData, "providerAgentId"),
        phoneNumber: getString(formData, "phoneNumber"),
        agentId: getString(formData, "agentId"),
    });

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid channel details.",
        };
    }

    const {
        callType,
        providerAgentId,
        phoneNumber,
        agentId,
    } = parsed.data;

    const normalizedPhoneNumber = phoneNumber?.trim() || null;

    if (callType === "PHONE") {
        if (!normalizedPhoneNumber) {
            return {
                success: false,
                error: "Phone number is required for a phone channel.",
            };
        }

        if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
            return {
                success: false,
                error: "Enter a valid phone number in international format.",
            };
        }
    }

    if (callType === "WEB" && normalizedPhoneNumber) {
        return {
            success: false,
            error: "Web Call channels should not have a phone number.",
        };
    }

    // Only allow an active agent belonging to this business.
    const agent = await db.agent.findFirst({
        where: {
            id: agentId,
            businessId: business.id,
            isActive: true,
        },
        select: {
            id: true,
        },
    });

    if (!agent) {
        return {
            success: false,
            error: "Select an active agent from your workspace.",
        };
    }

    try {
        await db.voiceChannel.create({
            data: {
                id: crypto.randomUUID(),
                businessId: business.id,
                agentId: agent.id,
                provider: "RETELL",
                providerAgentId,
                phoneNumber: callType === "PHONE"
                    ? normalizedPhoneNumber
                    : null,
                isActive: true,
            },
        });
    } catch (error) {
        // Handles duplicate Retell Agent IDs and phone numbers.
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return {
                success: false,
                error: "This Retell Agent ID or phone number is already configured.",
            };
        }

        throw error;
    }

    revalidatePath("/integrations/voice");
    revalidatePath("/conversations");

    return { success: true };
}

export async function setVoiceChannelActive(formData: FormData) {
    const business = await requireCurrentBusiness();

    const parsed = activationSchema.safeParse({
        channelId: getString(formData, "channelId"),
        active: getString(formData, "active"),
    });

    if (!parsed.success) {
        return {
            success: false,
            error: "Invalid voice channel update.",
        };
    }

    const channel = await db.voiceChannel.findFirst({
        where: {
            id: parsed.data.channelId,
            businessId: business.id,
        },
        include: {
            agent: {
                select: {
                    isActive: true,
                },
            },
        },
    });

    if (!channel) {
        return {
            success: false,
            error: "Voice channel not found in your workspace.",
        };
    }

    const active = parsed.data.active === "true";

    if (active && !channel.agent.isActive) {
        return {
            success: false,
            error: "Activate the assigned AI agent before activating this channel.",
        };
    }

    await db.voiceChannel.updateMany({
        where: {
            id: channel.id,
            businessId: business.id,
        },
        data: {
            isActive: active,
        },
    });

    revalidatePath("/integrations/voice");
    revalidatePath("/conversations");

    return { success: true };
}
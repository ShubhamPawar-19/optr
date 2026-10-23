import { db } from "../../lib/db";

type GetOrCreateContactParams = {
    businessId: string;
    channel: string;
    externalId: string;
    name?: string | null;
};

function normalizeExternalId(channel: string, externalId: string) {
    const value = externalId.trim();

    if (channel.toUpperCase() === "WHATSAPP") {
        // WhatsApp sender IDs are phone numbers; remove formatting.
        return value.replace(/\D/g, "");
    }

    return value;
}


export async function getOrCreateContact(
    params: GetOrCreateContactParams,
) {
    const channel = params.channel.trim().toUpperCase();
    const externalId = normalizeExternalId(
        channel,
        params.externalId,
    );

    if (!params.businessId.trim()) {
        throw new Error("businessId is required");
    }

    if (!channel || !externalId) {
        throw new Error("channel and externalId are required");
    }

    const name = params.name?.trim() || null;

    const identity = await db.contactIdentity.upsert({
        where: {
            businessId_channel_externalId: {
                businessId: params.businessId,
                channel,
                externalId,
            },
        },
        update: {},
        create: {
            business: {
                connect: { id: params.businessId },
            },
            channel,
            externalId,
            contact: {
                create: {
                    business: {
                        connect: { id: params.businessId },
                    },
                    name,
                    phone:
                        channel === "WHATSAPP"
                            ? externalId
                            : null,
                },
            },
        },
        include: {
            contact: true,
        },
    });

    // Fill in a missing name without overwriting an existing one.
    if (!identity.contact.name && name) {
        await db.contact.updateMany({
            where: {
                id: identity.contact.id,
                name: null,
            },
            data: { name },
        });
    }

    return db.contact.findUniqueOrThrow({
        where: { id: identity.contact.id },
    });
}

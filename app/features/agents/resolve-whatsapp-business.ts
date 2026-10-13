
import { db } from "@/app/lib/db";

export async function resolveWhatsAppBusiness(
    phoneNumberId: string,
): Promise<string | null> {
    const channel = await db.whatsAppChannel.findUnique({
        where: {
            phoneNumberId,
        },
        select: {
            businessId: true,
            isActive: true,
        },
    });

    if (!channel || !channel.isActive) {
        return null;
    }

    return channel.businessId;
}
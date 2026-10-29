
import { db } from "@/app/lib/db";
import { decryptWhatsAppToken } from "./encrypt-token";

export type WhatsAppChannelCredentials = {
    accessToken: string;
    phoneNumberId: string;
};

export async function getWhatsAppChannelCredentials(
    phoneNumberId: string,
): Promise<WhatsAppChannelCredentials> {
    const channel = await db.whatsAppChannel.findUnique({
        where: { phoneNumberId },
        select: {
            phoneNumberId: true,
            encryptedAccessToken: true,
            isActive: true,
        },
    });

    if (channel && !channel.isActive) {
        throw new Error("WhatsApp channel is inactive");
    }

    if (channel?.encryptedAccessToken) {
        return {
            accessToken: decryptWhatsAppToken(channel.encryptedAccessToken),
            phoneNumberId: channel.phoneNumberId,
        };
    }

    // Temporary development fallback for the existing Meta test number.
    const testAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const testPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (
        testAccessToken &&
        testPhoneNumberId &&
        testPhoneNumberId === phoneNumberId
    ) {
        return {
            accessToken: testAccessToken,
            phoneNumberId: testPhoneNumberId,
        };
    }

    throw new Error(
        "WhatsApp credentials are not configured for this channel",
    );
}

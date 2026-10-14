
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWhatsAppSignature(
    rawBody: string,
    signature: string | null,
): boolean {
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (!appSecret || !signature) {
        return false;
    }

    const receivedSignature = signature.trim();

    // WhatsApp sends signatures in the format: sha256=<64 hex characters>
    if (!/^sha256=[a-f0-9]{64}$/i.test(receivedSignature)) {
        return false;
    }

    const expectedSignature =
        "sha256=" +
        createHmac("sha256", appSecret.trim())
            .update(rawBody, "utf8")
            .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(receivedSignature, "utf8");

    return timingSafeEqual(expected, received);
}

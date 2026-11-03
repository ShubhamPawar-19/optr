import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function verifyWhatsAppSignature(
    rawBody: string,
    signature: string | null,
): boolean {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    console.log("[webhook-signature] Runtime secret fingerprint:", {
    fingerprint: appSecret
        ? createHash("sha256")
              .update(appSecret.trim())
              .digest("hex")
              .slice(0, 16)
        : null,
});
    if (!appSecret || !signature) {
        console.error("[webhook-signature] Missing configuration", {
            secretConfigured: Boolean(appSecret),
            signaturePresent: Boolean(signature),
        });
        return false;
    }

    const received = signature.trim();

    if (!/^sha256=[a-f0-9]{64}$/i.test(received)) {
        console.error("[webhook-signature] Invalid signature format");
        return false;
    }

    const expected =
        "sha256=" +
        createHmac("sha256", appSecret.trim())
            .update(rawBody, "utf8")
            .digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(received, "utf8");

    const valid =
        expectedBuffer.length === receivedBuffer.length &&
        timingSafeEqual(expectedBuffer, receivedBuffer);

    console.log("[webhook-signature] Diagnostic", {
        valid,
        bodyLength: Buffer.byteLength(rawBody, "utf8"),
        signatureHeaderPresent: true,
        secretLength: appSecret.trim().length,
    });

    return valid;
}
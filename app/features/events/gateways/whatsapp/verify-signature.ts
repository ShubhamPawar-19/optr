import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWhatsAppSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret || !signature) {
    console.error("WhatsApp signature inputs missing", {
      appSecretPresent: !!appSecret,
      signaturePresent: !!signature,
    });
    return false;
  }

  const expectedSignature =
    "sha256=" +
    createHmac("sha256", appSecret.trim())
      .update(rawBody, "utf8")
      .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature.trim(), "utf8");

  const matches =
    expected.length === received.length && timingSafeEqual(expected, received);

  if (!matches) {
    console.error("WhatsApp signature mismatch", {
      bodyLength: Buffer.byteLength(rawBody, "utf8"),
      signatureHeaderPresent: true,
      signatureFormatValid: /^sha256=[a-f0-9]{64}$/i.test(signature.trim()),
    });
  }

  return matches;
}

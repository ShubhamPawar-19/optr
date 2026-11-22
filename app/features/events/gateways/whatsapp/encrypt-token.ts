import {
    decryptToken,
    encryptToken,
} from "@/app/lib/server/encryption/token-encryption";

export function encryptWhatsAppToken(token: string): string {
    if (!token.trim()) {
        throw new Error("Cannot encrypt an empty WhatsApp access token");
    }

    return encryptToken(token, "WHATSAPP");
}

export function decryptWhatsAppToken(encryptedToken: string): string {
    return decryptToken(encryptedToken, "WHATSAPP");
}
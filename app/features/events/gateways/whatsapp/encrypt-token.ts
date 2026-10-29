
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
    const encodedKey = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;

    if (!encodedKey || !/^[a-f0-9]{64}$/i.test(encodedKey)) {
        throw new Error(
            "WHATSAPP_TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal key",
        );
    }

    const key = Buffer.from(encodedKey, "hex");

    if (key.length !== KEY_LENGTH) {
        throw new Error("Invalid WhatsApp token encryption key length");
    }

    return key;
}

export function encryptWhatsAppToken(token: string): string {
    if (!token.trim()) {
        throw new Error("Cannot encrypt an empty WhatsApp access token");
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    const ciphertext = Buffer.concat([
        cipher.update(token, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        "v1",
        iv.toString("hex"),
        authTag.toString("hex"),
        ciphertext.toString("hex"),
    ].join(":");
}

export function decryptWhatsAppToken(encryptedToken: string): string {
    const [version, ivHex, authTagHex, ciphertextHex, ...extra] =
        encryptedToken.split(":");

    if (
        version !== "v1" ||
        !ivHex ||
        !authTagHex ||
        !ciphertextHex ||
        extra.length > 0 ||
        !/^[a-f0-9]+$/i.test(ivHex) ||
        !/^[a-f0-9]+$/i.test(authTagHex) ||
        !/^[a-f0-9]+$/i.test(ciphertextHex)
    ) {
        throw new Error("Invalid encrypted WhatsApp token format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    if (
        iv.length !== IV_LENGTH ||
        authTag.length !== AUTH_TAG_LENGTH ||
        ciphertext.length === 0
    ) {
        throw new Error("Invalid encrypted WhatsApp token components");
    }

    const decipher = createDecipheriv(
        ALGORITHM,
        getEncryptionKey(),
        iv,
    );

    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    return plaintext.toString("utf8");
}

import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export function encryptAesGcm(
    plaintext: string,
    key: Buffer,
): string {
    if (!plaintext.trim()) {
        throw new Error("Cannot encrypt an empty token");
    }

    if (key.length !== KEY_LENGTH) {
        throw new Error("AES-256-GCM requires a 32-byte encryption key");
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);

    return [
        "v1",
        iv.toString("hex"),
        cipher.getAuthTag().toString("hex"),
        ciphertext.toString("hex"),
    ].join(":");
}

export function decryptAesGcm(
    encryptedValue: string,
    key: Buffer,
): string {
    if (key.length !== KEY_LENGTH) {
        throw new Error("AES-256-GCM requires a 32-byte encryption key");
    }

    const [version, ivHex, authTagHex, ciphertextHex, ...extra] =
        encryptedValue.split(":");

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
        throw new Error("Invalid encrypted token format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    if (
        iv.length !== IV_LENGTH ||
        authTag.length !== AUTH_TAG_LENGTH ||
        ciphertext.length === 0
    ) {
        throw new Error("Invalid encrypted token components");
    }

    const decipher = createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    return plaintext.toString("utf8");
}
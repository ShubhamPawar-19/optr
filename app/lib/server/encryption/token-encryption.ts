import "server-only";

import {
    decryptAesGcm,
    encryptAesGcm,
} from "./aes-gcm";

export type TokenProvider = "WHATSAPP" | "GOOGLE_CALENDAR";

const ENCRYPTION_KEY_ENV: Record<TokenProvider, string> = {
    WHATSAPP: "WHATSAPP_TOKEN_ENCRYPTION_KEY",
    GOOGLE_CALENDAR: "GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY",
};

function getEncryptionKey(provider: TokenProvider): Buffer {
    const envName = ENCRYPTION_KEY_ENV[provider];
    const encodedKey = process.env[envName];

    if (!encodedKey || !/^[a-f0-9]{64}$/i.test(encodedKey)) {
        throw new Error(
            `${envName} must be a 64-character hexadecimal key`,
        );
    }

    const key = Buffer.from(encodedKey, "hex");

    if (key.length !== 32) {
        throw new Error(`Invalid ${provider} encryption key length`);
    }

    return key;
}

export function encryptToken(
    token: string,
    provider: TokenProvider,
): string {
    return encryptAesGcm(token, getEncryptionKey(provider));
}

export function decryptToken(
    encryptedToken: string,
    provider: TokenProvider,
): string {
    return decryptAesGcm(encryptedToken, getEncryptionKey(provider));
}
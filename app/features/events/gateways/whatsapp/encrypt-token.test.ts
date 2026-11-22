
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCipheriv } from "node:crypto";

import {
    decryptWhatsAppToken,
    encryptWhatsAppToken,
} from "./encrypt-token";

const LEGACY_TEST_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function createLegacyCiphertext(token: string, key: Buffer): string {
    const iv = Buffer.from("000102030405060708090a0b", "hex");

    const cipher = createCipheriv("aes-256-gcm", key, iv);

    const ciphertext = Buffer.concat([
        cipher.update(token, "utf8"),
        cipher.final(),
    ]);

    return [
        "v1",
        iv.toString("hex"),
        cipher.getAuthTag().toString("hex"),
        ciphertext.toString("hex"),
    ].join(":");
}

describe("WhatsApp token encryption compatibility", () => {
    it("decrypts ciphertext produced by the original WhatsApp implementation", () => {
        const previousKey = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;

        try {
            process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = LEGACY_TEST_KEY;

            const key = Buffer.from(LEGACY_TEST_KEY, "hex");
            const legacyCiphertext = createLegacyCiphertext(
                "legacy-whatsapp-test-token",
                key,
            );

            assert.equal(
                decryptWhatsAppToken(legacyCiphertext),
                "legacy-whatsapp-test-token",
            );
        } finally {
            if (previousKey === undefined) {
                delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
            } else {
                process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = previousKey;
            }
        }
    });

    it("encrypts and decrypts tokens using the existing WhatsApp API", () => {
        const previousKey = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;

        try {
            process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = LEGACY_TEST_KEY;

            const token = "legacy-whatsapp-test-token";
            const encrypted = encryptWhatsAppToken(token);

            assert.equal(decryptWhatsAppToken(encrypted), token);
            assert.match(encrypted, /^v1:/);
        } finally {
            if (previousKey === undefined) {
                delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
            } else {
                process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = previousKey;
            }
        }
    });

    it("rejects empty WhatsApp tokens", () => {
        assert.throws(
            () => encryptWhatsAppToken("   "),
            /empty WhatsApp access token/i,
        );
    });

    it("rejects invalid WhatsApp encryption configuration", () => {
        const previousKey = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;

        try {
            process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = "invalid";

            assert.throws(
                () => encryptWhatsAppToken("test-token"),
                /WHATSAPP_TOKEN_ENCRYPTION_KEY/,
            );
        } finally {
            if (previousKey === undefined) {
                delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
            } else {
                process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = previousKey;
            }
        }
    });
});

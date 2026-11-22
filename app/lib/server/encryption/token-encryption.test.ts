import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    decryptToken,
    encryptToken,
} from "./token-encryption";

const WHATSAPP_KEY = "a".repeat(64);
const GOOGLE_CALENDAR_KEY = "b".repeat(64);

describe("Provider token encryption", () => {
    it("isolates WhatsApp and Google Calendar encryption keys", () => {
        const previousWhatsAppKey =
            process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
        const previousGoogleKey =
            process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;

        try {
            process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = WHATSAPP_KEY;
            process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY =
                GOOGLE_CALENDAR_KEY;

            const token = "provider-isolation-test";

            const whatsappCiphertext = encryptToken(token, "WHATSAPP");
            const googleCiphertext = encryptToken(
                token,
                "GOOGLE_CALENDAR",
            );

            assert.equal(
                decryptToken(whatsappCiphertext, "WHATSAPP"),
                token,
            );

            assert.equal(
                decryptToken(googleCiphertext, "GOOGLE_CALENDAR"),
                token,
            );

            assert.throws(
                () => decryptToken(whatsappCiphertext, "GOOGLE_CALENDAR"),
            );

            assert.throws(
                () => decryptToken(googleCiphertext, "WHATSAPP"),
            );
        } finally {
            if (previousWhatsAppKey === undefined) {
                delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
            } else {
                process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY =
                    previousWhatsAppKey;
            }

            if (previousGoogleKey === undefined) {
                delete process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;
            } else {
                process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY =
                    previousGoogleKey;
            }
        }
    });

    it("rejects a missing provider encryption key", () => {
        const previousKey =
            process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;

        try {
            delete process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;

            assert.throws(
                () => encryptToken("test-token", "GOOGLE_CALENDAR"),
                /GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY/,
            );
        } finally {
            if (previousKey !== undefined) {
                process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY =
                    previousKey;
            }
        }
    });

    it("rejects a malformed provider encryption key", () => {
        const previousKey =
            process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;

        try {
            process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY = "invalid";

            assert.throws(
                () => encryptToken("test-token", "GOOGLE_CALENDAR"),
                /64-character hexadecimal key/,
            );
        } finally {
            if (previousKey === undefined) {
                delete process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;
            } else {
                process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY =
                    previousKey;
            }
        }
    });
});
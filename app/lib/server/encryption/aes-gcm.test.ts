import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    decryptAesGcm,
    encryptAesGcm,
} from "./aes-gcm";

const TEST_KEY = Buffer.from(
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "hex",
);

describe("AES-256-GCM token encryption", () => {
    it("encrypts and decrypts a token", () => {
        const token = "test-access-token-123";

        const encrypted = encryptAesGcm(token, TEST_KEY);

        assert.notEqual(encrypted, token);
        assert.equal(decryptAesGcm(encrypted, TEST_KEY), token);
    });

    it("uses a unique IV for each encryption", () => {
        const token = "same-token";

        const first = encryptAesGcm(token, TEST_KEY);
        const second = encryptAesGcm(token, TEST_KEY);

        assert.notEqual(first, second);
    });

    it("rejects an empty token", () => {
        assert.throws(
            () => encryptAesGcm("   ", TEST_KEY),
            /empty token/i,
        );
    });

    it("rejects an invalid encryption key length", () => {
        const invalidKey = Buffer.alloc(16);

        assert.throws(
            () => encryptAesGcm("test-token", invalidKey),
            /32-byte/i,
        );
    });

    it("rejects malformed ciphertext", () => {
        assert.throws(
            () => decryptAesGcm("invalid-ciphertext", TEST_KEY),
            /Invalid encrypted token format/i,
        );
    });

    it("rejects ciphertext tampering", () => {
        const encrypted = encryptAesGcm("sensitive-token", TEST_KEY);
        const parts = encrypted.split(":");

        const ciphertext = parts[3];
        assert.ok(ciphertext);

        const replacement = ciphertext[0] === "a" ? "b" : "a";
        parts[3] = replacement + ciphertext.slice(1);

        assert.throws(
            () => decryptAesGcm(parts.join(":"), TEST_KEY),
        );
    });

    it("rejects decryption with a different key", () => {
        const encrypted = encryptAesGcm("sensitive-token", TEST_KEY);
        const differentKey = Buffer.alloc(32, 7);

        assert.throws(
            () => decryptAesGcm(encrypted, differentKey),
        );
    });
});
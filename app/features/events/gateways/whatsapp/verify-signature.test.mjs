
import { createHmac } from "node:crypto";
import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { verifyWhatsAppSignature } from "./verify-signature.ts";

const originalSecret = process.env.WHATSAPP_APP_SECRET;

const rawBody = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [],
});

function createSignature(body, secret) {
    return (
        "sha256=" +
        createHmac("sha256", secret)
            .update(body, "utf8")
            .digest("hex")
    );
}

afterEach(() => {
    if (originalSecret === undefined) {
        delete process.env.WHATSAPP_APP_SECRET;
    } else {
        process.env.WHATSAPP_APP_SECRET = originalSecret;
    }
});

describe("verifyWhatsAppSignature", () => {
    it("accepts a valid signature", () => {
        process.env.WHATSAPP_APP_SECRET = "test-secret";
        const signature = createSignature(rawBody, "test-secret");

        assert.equal(verifyWhatsAppSignature(rawBody, signature), true);
    });

    it("rejects an incorrect signature", () => {
        process.env.WHATSAPP_APP_SECRET = "test-secret";
        const signature = createSignature(rawBody, "wrong-secret");

        assert.equal(verifyWhatsAppSignature(rawBody, signature), false);
    });

    it("rejects a missing signature", () => {
        process.env.WHATSAPP_APP_SECRET = "test-secret";

        assert.equal(verifyWhatsAppSignature(rawBody, null), false);
    });

    it("rejects malformed signatures", () => {
        process.env.WHATSAPP_APP_SECRET = "test-secret";

        assert.equal(verifyWhatsAppSignature(rawBody, "invalid"), false);
        assert.equal(
            verifyWhatsAppSignature(rawBody, "sha256=1234"),
            false,
        );
    });

    it("rejects a missing app secret", () => {
        delete process.env.WHATSAPP_APP_SECRET;
        const signature = createSignature(rawBody, "test-secret");

        assert.equal(verifyWhatsAppSignature(rawBody, signature), false);
    });

    it("rejects a signature for a different request body", () => {
        process.env.WHATSAPP_APP_SECRET = "test-secret";
        const signature = createSignature(rawBody, "test-secret");

        assert.equal(
            verifyWhatsAppSignature(rawBody + " ", signature),
            false,
        );
    });
});

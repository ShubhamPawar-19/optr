import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    isWhatsAppWebhookPayload,
    parseWhatsAppPayload,
} from "./parse-payload.ts";

describe("parseWhatsAppPayload", () => {
    it("parses valid JSON", () => {
        const result = parseWhatsAppPayload(
            JSON.stringify({ entry: [] }),
        );

        assert.equal(result.success, true);

        if (result.success) {
            assert.deepEqual(result.body, { entry: [] });
        }
    });

    it("rejects malformed JSON", () => {
        assert.deepEqual(
            parseWhatsAppPayload("{invalid json"),
            { success: false },
        );
    });

    it("accepts valid JSON with an unexpected structure at the parsing stage", () => {
        const result = parseWhatsAppPayload("null");

        assert.equal(result.success, true);

        if (result.success) {
            assert.equal(result.body, null);
            assert.equal(isWhatsAppWebhookPayload(result.body), false);
        }
    });

    it("rejects empty input", () => {
        assert.deepEqual(
            parseWhatsAppPayload(""),
            { success: false },
        );
    });
});

describe("isWhatsAppWebhookPayload", () => {
    it("accepts a valid webhook payload", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{
                    changes: [{
                        value: {
                            metadata: { phone_number_id: "12345" },
                            messages: [{
                                id: "wamid.test",
                                from: "919999999999",
                                type: "text",
                                timestamp: "1791878400",
                                text: { body: "Hello" },
                            }],
                            contacts: [{
                                profile: { name: "Test User" },
                            }],
                        },
                    }],
                }],
            }),
            true,
        );
    });

    it("accepts a contact with a WhatsApp ID", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{
                    changes: [{
                        value: {
                            contacts: [{
                                wa_id: "919999999999",
                                profile: { name: "Test User" },
                            }],
                        },
                    }],
                }],
            }),
            true,
        );
    });

    it("rejects a contact with a non-string WhatsApp ID", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{
                    changes: [{
                        value: {
                            contacts: [{ wa_id: 12345 }],
                        },
                    }],
                }],
            }),
            false,
        );
    });

    it("rejects a string instead of an entry array", () => {
        assert.equal(
            isWhatsAppWebhookPayload({ entry: "unexpected" }),
            false,
        );
    });

    it("rejects malformed nested changes", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{ changes: "unexpected" }],
            }),
            false,
        );
    });

    it("rejects a missing changes array", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{}],
            }),
            false,
        );
    });

    it("rejects a message with an invalid field type", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{ id: 123 }],
                        },
                    }],
                }],
            }),
            false,
        );
    });

    it("accepts a valid status event without messages", () => {
        assert.equal(
            isWhatsAppWebhookPayload({
                entry: [{
                    changes: [{
                        value: {
                            metadata: { phone_number_id: "12345" },
                        },
                    }],
                }],
            }),
            true,
        );
    });
});
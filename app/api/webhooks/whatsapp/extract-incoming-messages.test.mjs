
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractIncomingWhatsAppMessages } from "./extract-incoming-messages.ts";

const timestamp = "1791878400";

function makeChange({ phoneNumberId = "phone-1", messages = [], contacts } = {}) {
    return {
        value: {
            metadata: { phone_number_id: phoneNumberId },
            messages,
            ...(contacts ? { contacts } : {}),
        },
    };
}

function makeMessage(id, from = "919999999999", text = "Hello") {
    return {
        id,
        from,
        type: "text",
        timestamp,
        text: { body: text },
    };
}

describe("extractIncomingWhatsAppMessages", () => {
    it("extracts every message in one change", () => {
        const result = extractIncomingWhatsAppMessages({
            entry: [{
                changes: [{
                    ...makeChange({
                        messages: [
                            makeMessage("message-1"),
                            makeMessage("message-2", "918888888888", "Hi"),
                        ],
                    }),
                }],
            }],
        });

        assert.equal(result.success, true);
        if (!result.success) return;

        assert.equal(result.messages.length, 2);
        assert.equal(result.messages[0].payload.messageId, "message-1");
        assert.equal(result.messages[1].payload.messageId, "message-2");
        assert.equal(result.messages[1].payload.text, "Hi");
    });

    it("extracts messages across multiple entries and changes", () => {
        const result = extractIncomingWhatsAppMessages({
            entry: [
                {
                    changes: [
                        makeChange({ messages: [makeMessage("message-1")] }),
                        makeChange({
                            phoneNumberId: "phone-2",
                            messages: [makeMessage("message-2")],
                        }),
                    ],
                },
                {
                    changes: [
                        makeChange({ messages: [makeMessage("message-3")] }),
                    ],
                },
            ],
        });

        assert.equal(result.success, true);
        if (!result.success) return;

        assert.deepEqual(
            result.messages.map((message) => [
                message.phoneNumberId,
                message.payload.messageId,
            ]),
            [
                ["phone-1", "message-1"],
                ["phone-2", "message-2"],
                ["phone-1", "message-3"],
            ],
        );
    });

    it("ignores status-only changes", () => {
        const result = extractIncomingWhatsAppMessages({
            entry: [{
                changes: [{
                    value: {
                        metadata: { phone_number_id: "phone-1" },
                    },
                }],
            }],
        });

        assert.deepEqual(result, { success: true, messages: [] });
    });

    it("rejects the batch when a message timestamp is invalid", () => {
        const result = extractIncomingWhatsAppMessages({
            entry: [{
                changes: [{
                    ...makeChange({
                        messages: [
                            makeMessage("message-1"),
                            {
                                ...makeMessage("message-2"),
                                timestamp: "invalid",
                            },
                        ],
                    }),
                }],
            }],
        });

        assert.deepEqual(result, {
            success: false,
            error: "INVALID_TIMESTAMP",
        });
    });

    it("matches contact names by sender when multiple contacts exist", () => {
        const result = extractIncomingWhatsAppMessages({
            entry: [{
                changes: [{
                    ...makeChange({
                        messages: [makeMessage("message-1", "918888888888")],
                        contacts: [
                            {
                                wa_id: "919999999999",
                                profile: { name: "First Person" },
                            },
                            {
                                wa_id: "918888888888",
                                profile: { name: "Second Person" },
                            },
                        ],
                    }),
                }],
            }],
        });

        assert.equal(result.success, true);
        if (!result.success) return;

        assert.equal(result.messages[0].payload.name, "Second Person");
    });
});

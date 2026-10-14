import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseWhatsAppTimestamp } from "./validate-timestamp.ts";

describe("parseWhatsAppTimestamp", () => {
    it("converts a valid Unix timestamp in seconds to ISO format", () => {
        assert.equal(
            parseWhatsAppTimestamp("1791878400"),
            new Date(1791878400 * 1000).toISOString(),
        );
    });

    it("rejects a missing timestamp", () => {
        assert.equal(parseWhatsAppTimestamp(undefined), null);
    });

    it("rejects an empty timestamp", () => {
        assert.equal(parseWhatsAppTimestamp(""), null);
    });

    it("rejects whitespace-only input", () => {
        assert.equal(parseWhatsAppTimestamp("   "), null);
    });

    it("rejects non-numeric input", () => {
        assert.equal(parseWhatsAppTimestamp("not-a-timestamp"), null);
    });

    it("rejects zero and negative timestamps", () => {
        assert.equal(parseWhatsAppTimestamp("0"), null);
        assert.equal(parseWhatsAppTimestamp("-100"), null);
    });

    it("rejects timestamps outside the JavaScript Date range", () => {
        assert.equal(parseWhatsAppTimestamp("1e100"), null);
    });

    it("rejects non-string values", () => {
        assert.equal(parseWhatsAppTimestamp(1791878400), null);
        assert.equal(parseWhatsAppTimestamp(null), null);
    });
});

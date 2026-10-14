import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isDuplicateRunError } from "./is-duplicate-run-error.ts";

describe("isDuplicateRunError", () => {
    it("recognizes the AgentRun composite unique constraint", () => {
        assert.equal(
            isDuplicateRunError({
                code: "P2002",
                meta: { target: ["agentId", "eventId"] },
            }),
            true,
        );
    });

    it("recognizes the named AgentRun unique constraint", () => {
        assert.equal(
            isDuplicateRunError({
                code: "P2002",
                meta: {
                    target: "AgentRun_agentId_eventId_key",
                },
            }),
            true,
        );
    });

    it("rejects unrelated unique constraints", () => {
        assert.equal(
            isDuplicateRunError({
                code: "P2002",
                meta: {
                    target: ["conversationId", "externalId"],
                },
            }),
            false,
        );
    });

    it("rejects errors with a different code", () => {
        assert.equal(
            isDuplicateRunError({
                code: "P2025",
                meta: { target: ["agentId", "eventId"] },
            }),
            false,
        );
    });

    it("rejects malformed errors", () => {
        assert.equal(isDuplicateRunError(null), false);
        assert.equal(isDuplicateRunError(undefined), false);
        assert.equal(
            isDuplicateRunError(new Error("failure")),
            false,
        );
        assert.equal(
            isDuplicateRunError({ code: "P2002" }),
            false,
        );
    });
});

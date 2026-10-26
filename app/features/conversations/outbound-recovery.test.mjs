
import test from "node:test";
import assert from "node:assert/strict";
import { decideOutboundRecovery } from "./outbound-recovery.ts";

const now = new Date("2026-10-26T10:00:00.000Z");
const createdAt = new Date("2026-10-26T09:50:00.000Z");

test("flags stale SENDING messages for investigation", () => {
    assert.deepEqual(
        decideOutboundRecovery({ status: "SENDING", createdAt, now }),
        { action: "investigate", reason: "stale-sending" },
    );
});

test("flags UNKNOWN messages for investigation", () => {
    assert.deepEqual(
        decideOutboundRecovery({ status: "UNKNOWN", createdAt, now }),
        { action: "investigate", reason: "uncertain-outcome" },
    );
});

test("ignores recent messages", () => {
    assert.deepEqual(
        decideOutboundRecovery({
            status: "SENDING",
            createdAt: new Date(now.getTime() - 60_000),
            now,
        }),
        { action: "ignore" },
    );
});

test("never flags delivered messages", () => {
    assert.deepEqual(
        decideOutboundRecovery({ status: "DELIVERED", createdAt, now }),
        { action: "ignore" },
    );
});

test("ignores invalid dates and thresholds", () => {
    assert.deepEqual(
        decideOutboundRecovery({
            status: "UNKNOWN",
            createdAt: new Date("invalid"),
            now,
        }),
        { action: "ignore" },
    );

    assert.deepEqual(
        decideOutboundRecovery({
            status: "UNKNOWN",
            createdAt,
            now,
            staleAfterMs: -1,
        }),
        { action: "ignore" },
    );
});

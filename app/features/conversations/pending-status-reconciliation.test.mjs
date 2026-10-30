
import test from "node:test";
import assert from "node:assert/strict";
import { decidePendingWhatsAppStatus } from "./pending-status-reconciliation.ts";

const pending = (overrides = {}) => ({
    id: "pending-1",
    externalId: "wamid.test-123",
    status: "delivered",
    timestamp: 1793010000,
    ...overrides,
});

test("applies a valid status transition", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: "SENT",
            pending: pending(),
        }),
        {
            action: "apply",
            status: "DELIVERED",
            timestamp: 1793010000,
            error: undefined,
        },
    );
});

test("keeps the callback pending when the message is not found", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: null,
            pending: pending(),
        }),
        { action: "keep-pending" },
    );
});

test("marks a duplicate callback as processed", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: "DELIVERED",
            pending: pending(),
        }),
        { action: "mark-processed" },
    );
});

test("does not downgrade READ when a late SENT callback arrives", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: "READ",
            pending: pending({ status: "sent" }),
        }),
        { action: "mark-processed" },
    );
});

test("keeps an invalid timestamp pending", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: "SENT",
            pending: pending({ timestamp: 0 }),
        }),
        { action: "keep-pending" },
    );
});


test("preserves the failure reason when applying FAILED", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: "UNKNOWN",
            pending: pending({
                status: "failed",
                error: "Recipient unavailable",
            }),
        }),
        {
            action: "apply",
            status: "FAILED",
            timestamp: 1793010000,
            error: "Recipient unavailable",
        },
    );
});

test("keeps an invalid persisted status pending", () => {
    assert.deepEqual(
        decidePendingWhatsAppStatus({
            currentStatus: "SENT",
            pending: pending({ status: "unexpected-status" }),
        }),
        { action: "keep-pending" },
    );
});


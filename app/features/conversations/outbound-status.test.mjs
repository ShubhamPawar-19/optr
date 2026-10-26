
import test from "node:test";
import assert from "node:assert/strict";
import { getOutboundStatusTransition } from "./outbound-status.ts";

test("advances from SENT to DELIVERED to READ", () => {
    assert.deepEqual(getOutboundStatusTransition("SENT", "delivered"), {
        status: "DELIVERED",
        shouldUpdate: true,
    });

    assert.deepEqual(getOutboundStatusTransition("DELIVERED", "read"), {
        status: "READ",
        shouldUpdate: true,
    });
});

test("allows READ to skip intermediate callbacks", () => {
    for (const current of ["SENDING", "UNKNOWN", "SENT", "DELIVERED"]) {
        assert.deepEqual(getOutboundStatusTransition(current, "read"), {
            status: "READ",
            shouldUpdate: true,
        });
    }
});

test("does not downgrade DELIVERED or READ on a late SENT callback", () => {
    assert.deepEqual(getOutboundStatusTransition("DELIVERED", "sent"), {
        status: "DELIVERED",
        shouldUpdate: false,
    });

    assert.deepEqual(getOutboundStatusTransition("READ", "sent"), {
        status: "READ",
        shouldUpdate: false,
    });
});

test("duplicate callbacks do not trigger updates", () => {
    assert.deepEqual(getOutboundStatusTransition("SENT", "sent"), {
        status: "SENT",
        shouldUpdate: false,
    });

    assert.deepEqual(getOutboundStatusTransition("READ", "read"), {
        status: "READ",
        shouldUpdate: false,
    });
});

test("allows delivery evidence to supersede FAILED", () => {
    assert.deepEqual(getOutboundStatusTransition("FAILED", "delivered"), {
        status: "DELIVERED",
        shouldUpdate: true,
    });
});

test("does not let a late failure replace a successful status", () => {
    assert.deepEqual(getOutboundStatusTransition("SENT", "failed"), {
        status: "SENT",
        shouldUpdate: false,
    });
});

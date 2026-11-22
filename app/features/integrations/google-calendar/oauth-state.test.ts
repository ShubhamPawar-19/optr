
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
    createOAuthState,
    consumeOAuthState,
    InvalidOAuthStateError,
    type OAuthStateDependencies,
} from "./oauth-state";

type StoredState = {
    stateHash: string;
    userId: string;
    businessId: string;
    expiresAt: Date;
    consumedAt: Date | null;
};

function createTestDependencies(options?: {
    ownsBusiness?: boolean;
}) {
    const states: StoredState[] = [];

    const dependencies: OAuthStateDependencies = {
        findBusiness: async () => options?.ownsBusiness ?? true,

        createState: async (data) => {
            states.push({
                ...data,
                consumedAt: null,
            });
        },

        consumeState: async ({ stateHash, userId, businessId, now }) => {
            const record = states.find(
                (item) =>
                    item.stateHash === stateHash &&
                    item.userId === userId &&
                    item.businessId === businessId &&
                    item.consumedAt === null &&
                    item.expiresAt > now,
            );

            if (!record) {
                return 0;
            }

            record.consumedAt = now;
            return 1;
        },
    };

    return { dependencies, states };
}

function hashState(state: string): string {
    return createHash("sha256")
        .update(state, "utf8")
        .digest("hex");
}

describe("Google Calendar OAuth state", () => {
    it("generates a cryptographically random URL-safe state", async () => {
        const { dependencies } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        assert.equal(state.length, 43);
        assert.match(state, /^[A-Za-z0-9_-]+$/);
    });

    it("stores only the SHA-256 hash, not the raw state", async () => {
        const { dependencies, states } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        assert.equal(states.length, 1);
        assert.equal(states[0].stateHash, hashState(state));
        assert.notEqual(states[0].stateHash, state);
    });

    it("rejects creation when the user does not own the business", async () => {
        const { dependencies, states } = createTestDependencies({
            ownsBusiness: false,
        });

        await assert.rejects(
            createOAuthState("user-1", "business-1", dependencies),
            {
                message: "Business access denied.",
            },
        );

        assert.equal(states.length, 0);
    });

    it("successfully consumes a valid state", async () => {
        const { dependencies } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        await assert.doesNotReject(
            consumeOAuthState(
                state,
                "user-1",
                "business-1",
                dependencies,
            ),
        );
    });

    it("rejects a state that does not exist", async () => {
        const { dependencies } = createTestDependencies();

        await assert.rejects(
            consumeOAuthState(
                "A".repeat(43),
                "user-1",
                "business-1",
                dependencies,
            ),
            InvalidOAuthStateError,
        );
    });

    it("rejects replay after a state has already been consumed", async () => {
        const { dependencies } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        await consumeOAuthState(
            state,
            "user-1",
            "business-1",
            dependencies,
        );

        await assert.rejects(
            consumeOAuthState(
                state,
                "user-1",
                "business-1",
                dependencies,
            ),
            InvalidOAuthStateError,
        );
    });

    it("rejects a state used by the wrong user or business", async () => {
        const { dependencies } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        await assert.rejects(
            consumeOAuthState(
                state,
                "user-2",
                "business-1",
                dependencies,
            ),
            InvalidOAuthStateError,
        );

        await assert.rejects(
            consumeOAuthState(
                state,
                "user-1",
                "business-2",
                dependencies,
            ),
            InvalidOAuthStateError,
        );

        // The original owner must still be able to consume it.
        await consumeOAuthState(
            state,
            "user-1",
            "business-1",
            dependencies,
        );
    });

    it("rejects expired states", async () => {
        const { dependencies, states } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        states[0].expiresAt = new Date(Date.now() - 1000);

        await assert.rejects(
            consumeOAuthState(
                state,
                "user-1",
                "business-1",
                dependencies,
            ),
            InvalidOAuthStateError,
        );
    });

    it("allows only one successful consumption under concurrent requests", async () => {
        const { dependencies } = createTestDependencies();

        const state = await createOAuthState(
            "user-1",
            "business-1",
            dependencies,
        );

        const results = await Promise.allSettled([
            consumeOAuthState(
                state,
                "user-1",
                "business-1",
                dependencies,
            ),
            consumeOAuthState(
                state,
                "user-1",
                "business-1",
                dependencies,
            ),
        ]);

        const successes = results.filter(
            (result) => result.status === "fulfilled",
        );

        const failures = results.filter(
            (result) => result.status === "rejected",
        );

        assert.equal(successes.length, 1);
        assert.equal(failures.length, 1);
        assert.ok(
            failures[0].status === "rejected" &&
            failures[0].reason instanceof InvalidOAuthStateError,
        );
    });
});

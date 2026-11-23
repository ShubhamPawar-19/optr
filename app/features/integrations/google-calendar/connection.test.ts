import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    GoogleCalendarConnectionError,
    type GoogleCalendarConnectionMetadata,
    type SaveGoogleCalendarConnectionInput,
    type ConnectionDependencies,
    type ConnectionTransaction,
    createConnectionService,
} from "./connection-core";

import type {
    GoogleAccountIdentity,
    GoogleOAuthTokens,
} from "./google-oauth-client";

type StoredConnection = GoogleCalendarConnectionMetadata & {
    googleAccountId: string;
    encryptedAccessToken: string;
    encryptedRefreshToken: string | null;
    accessTokenExpiresAt: Date;
    scope: string;
};

const identity: GoogleAccountIdentity = {
    googleAccountId: "google-account-1",
    email: "owner@example.com",
};

function createTokens(
    refreshToken: string | null = "refresh-token-1",
): GoogleOAuthTokens {
    return {
        accessToken: "access-token-1",
        refreshToken,
        expiresAt: new Date("2027-01-01T00:00:00.000Z"),
        scope: "calendar.events calendar.freebusy",
        tokenType: "Bearer",
    };
}

function createInput(
    overrides: Partial<SaveGoogleCalendarConnectionInput> = {},
): SaveGoogleCalendarConnectionInput {
    return {
        businessId: "business-1",
        identity,
        tokens: createTokens(),
        ...overrides,
    };
}

function createHarness(initial?: StoredConnection) {
    let stored = initial ? structuredClone(initial) : null;
    let transactionCalls = 0;
    let encryptionCalls = 0;
    let failEncryption = false;
    let transactionError: unknown = null;
    let transactionAttemptsBeforeSuccess = 0;

    const dependencies: ConnectionDependencies = {
        encrypt(token) {
            encryptionCalls++;

            if (failEncryption) {
                throw new Error("Encryption failed");
            }

            return `encrypted:${token}`;
        },

        async transaction<T>(
            operation: (tx: ConnectionTransaction) => Promise<T>,
        ): Promise<T> {
            transactionCalls++;

            if (transactionAttemptsBeforeSuccess > 0) {
                transactionAttemptsBeforeSuccess--;
                throw transactionError;
            }

            const snapshot = stored ? structuredClone(stored) : null;

            const delegate = {
                async findUnique() {
                    return snapshot;
                },

                async upsert(args: {
                    create: Record<string, unknown>;
                    update: Record<string, unknown>;
                }) {
                    const data = snapshot ? args.update : args.create;

                    stored = {
                        ...data,
                    } as StoredConnection;

                    return {
                        businessId: stored.businessId,
                        googleAccountEmail: stored.googleAccountEmail,
                        calendarId: stored.calendarId,
                        calendarName: stored.calendarName,
                        timezone: stored.timezone,
                        isActive: stored.isActive,
                    };
                },
            };

            const tx = {
                googleCalendarConnection: delegate,
            } as unknown as ConnectionTransaction;

            try {
                return await operation(tx);
            } catch (error) {
                stored = snapshot;
                throw error;
            }
        },
    };

    return {
        save: createConnectionService(dependencies),

        get stored() {
            return stored;
        },

        get transactionCalls() {
            return transactionCalls;
        },

        get encryptionCalls() {
            return encryptionCalls;
        },

        set failEncryption(value: boolean) {
            failEncryption = value;
        },

        set transactionError(value: unknown) {
            transactionError = value;
        },

        set transactionAttemptsBeforeSuccess(value: number) {
            transactionAttemptsBeforeSuccess = value;
        },
    };
}

function existingConnection(
    overrides: Partial<StoredConnection> = {},
): StoredConnection {
    return {
        businessId: "business-1",
        googleAccountId: "google-account-1",
        googleAccountEmail: "owner@example.com",
        encryptedAccessToken: "encrypted:old-access",
        encryptedRefreshToken: "encrypted:old-refresh",
        accessTokenExpiresAt: new Date("2026-12-01T00:00:00.000Z"),
        scope: "calendar.events",
        calendarId: "primary",
        calendarName: "Main Calendar",
        timezone: "Asia/Kolkata",
        isActive: true,
        ...overrides,
    };
}

describe("Google Calendar connection persistence", () => {
    it("rejects malformed runtime inputs safely", async () => {
        const harness = createHarness();

        const invalidInputs: unknown[] = [
            null,
            undefined,
            {},
            { businessId: "business-1" },
            {
                businessId: "business-1",
                identity: null,
                tokens: createTokens(),
            },
            {
                businessId: "business-1",
                identity: {
                    googleAccountId: 123,
                    email: "owner@example.com",
                },
                tokens: createTokens(),
            },
            {
                businessId: "business-1",
                identity,
                tokens: {
                    ...createTokens(),
                    accessToken: 123,
                },
            },
            {
                businessId: "business-1",
                identity,
                tokens: {
                    ...createTokens(),
                    expiresAt: "invalid-date",
                },
            },
            {
                businessId: "business-1",
                identity,
                tokens: {
                    ...createTokens(),
                    refreshToken: 123,
                },
            },
        ];

        for (const invalidInput of invalidInputs) {
            await assert.rejects(
                harness.save(
                    invalidInput as SaveGoogleCalendarConnectionInput,
                ),
                GoogleCalendarConnectionError,
            );
        }

        assert.equal(harness.transactionCalls, 0);
    });

    it("creates a first connection with encrypted credentials", async () => {
        const harness = createHarness();

        const result = await harness.save(createInput());

        assert.equal(result.businessId, "business-1");
        assert.equal(result.googleAccountEmail, "owner@example.com");
        assert.equal(harness.stored?.encryptedAccessToken, "encrypted:access-token-1");
        assert.equal(harness.stored?.encryptedRefreshToken, "encrypted:refresh-token-1");
        assert.equal(harness.stored?.calendarId, null);
        assert.equal(harness.stored?.isActive, true);
    });

    it("rejects a first connection without a refresh token", async () => {
        const harness = createHarness();

        await assert.rejects(
            harness.save(createInput({ tokens: createTokens(null) })),
            GoogleCalendarConnectionError,
        );

        assert.equal(harness.stored, null);
    });

    it("preserves calendar selection when reconnecting the same account", async () => {
        const harness = createHarness(existingConnection());

        await harness.save(
            createInput({
                tokens: createTokens("new-refresh-token"),
            }),
        );

        assert.equal(harness.stored?.calendarId, "primary");
        assert.equal(harness.stored?.calendarName, "Main Calendar");
        assert.equal(harness.stored?.timezone, "Asia/Kolkata");
        assert.equal(
            harness.stored?.encryptedRefreshToken,
            "encrypted:new-refresh-token",
        );
    });

    it("preserves the old refresh token when Google omits a new one", async () => {
        const harness = createHarness(existingConnection());

        await harness.save(
            createInput({
                tokens: createTokens(null),
            }),
        );

        assert.equal(
            harness.stored?.encryptedRefreshToken,
            "encrypted:old-refresh",
        );
        assert.equal(harness.stored?.calendarId, "primary");
    });

    it("clears calendar selection when connecting a different Google account", async () => {
        const harness = createHarness(existingConnection());

        await harness.save(
            createInput({
                identity: {
                    googleAccountId: "google-account-2",
                    email: "different@example.com",
                },
                tokens: createTokens("new-account-refresh"),
            }),
        );

        assert.equal(harness.stored?.googleAccountId, "google-account-2");
        assert.equal(harness.stored?.calendarId, null);
        assert.equal(harness.stored?.calendarName, null);
        assert.equal(harness.stored?.timezone, null);
        assert.equal(
            harness.stored?.encryptedRefreshToken,
            "encrypted:new-account-refresh",
        );
    });

    it("rejects switching accounts without a new refresh token", async () => {
        const original = existingConnection();
        const harness = createHarness(original);

        await assert.rejects(
            harness.save(
                createInput({
                    identity: {
                        googleAccountId: "google-account-2",
                        email: "different@example.com",
                    },
                    tokens: createTokens(null),
                }),
            ),
            GoogleCalendarConnectionError,
        );

        assert.deepEqual(harness.stored, original);
    });

    it("rejects a same-account reconnect if no previous refresh token exists", async () => {
        const harness = createHarness(
            existingConnection({ encryptedRefreshToken: null }),
        );

        await assert.rejects(
            harness.save(
                createInput({
                    tokens: createTokens(null),
                }),
            ),
            GoogleCalendarConnectionError,
        );

        assert.equal(harness.stored?.encryptedRefreshToken, null);
    });

    it("rejects invalid input before opening a transaction", async () => {
        const harness = createHarness();

        await assert.rejects(
            harness.save(createInput({ businessId: " " })),
            GoogleCalendarConnectionError,
        );

        assert.equal(harness.transactionCalls, 0);
    });

    it("does not open a transaction if encryption fails", async () => {
        const harness = createHarness();
        harness.failEncryption = true;

        await assert.rejects(
            harness.save(createInput()),
            Error,
        );

        assert.equal(harness.transactionCalls, 0);
    });

    it("retries a serialization conflict and succeeds on the next attempt", async () => {
        const harness = createHarness();

        const conflict = Object.assign(
            new Error("Serialization conflict"),
            { code: "P2034" },
        );

        harness.transactionError = conflict;
        harness.transactionAttemptsBeforeSuccess = 1;

        const result = await harness.save(createInput());

        assert.equal(result.businessId, "business-1");
        assert.equal(harness.transactionCalls, 2);
        assert.equal(harness.stored?.encryptedRefreshToken, "encrypted:refresh-token-1");
    });

    it("stops after three serialization conflicts", async () => {
        const harness = createHarness();

        const conflict = Object.assign(
            new Error("Serialization conflict"),
            { code: "P2034" },
        );

        harness.transactionError = conflict;
        harness.transactionAttemptsBeforeSuccess = 3;

        await assert.rejects(
            harness.save(createInput()),
            (error: unknown) => {
                assert.ok(error instanceof GoogleCalendarConnectionError);
                assert.equal(
                    error.message,
                    "Unable to save the Google Calendar connection.",
                );
                return true;
            },
        );

        assert.equal(harness.transactionCalls, 3);
        assert.equal(harness.stored, null);
    });

    it("does not retry non-serialization transaction errors", async () => {
        const harness = createHarness();

        harness.transactionError = new Error("Database unavailable");
        harness.transactionAttemptsBeforeSuccess = 3;

        await assert.rejects(
            harness.save(createInput()),
            GoogleCalendarConnectionError,
        );

        assert.equal(harness.transactionCalls, 1);
        assert.equal(harness.stored, null);
    });

    it("returns only safe connection metadata", async () => {
        const harness = createHarness();

        const result = await harness.save(createInput());

        assert.deepEqual(Object.keys(result).sort(), [
            "businessId",
            "calendarId",
            "calendarName",
            "googleAccountEmail",
            "isActive",
            "timezone",
        ]);
    });
});

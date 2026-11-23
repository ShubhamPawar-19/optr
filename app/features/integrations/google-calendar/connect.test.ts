import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
    createGoogleCalendarConnectHandler,
    type GoogleCalendarConnectDependencies,
} from "./connect";

const ORIGINAL_BASE_URL = process.env.BETTER_AUTH_URL;

const BASE_URL = "http://localhost:3000";
const BUSINESS_ID = "business-1";
const USER_ID = "user-1";
const GOOGLE_URL = "https://accounts.google.com/o/oauth2/v2/auth?state=test";

function createRequest(
    body: unknown = { businessId: BUSINESS_ID },
    options?: {
        origin?: string;
        contentType?: string;
        invalidJSON?: boolean;
    },
): Request {
    return new Request(`${BASE_URL}/api/integrations/google-calendar/connect`, {
        method: "POST",
        headers: {
            origin: options?.origin ?? BASE_URL,
            "content-type": options?.contentType ?? "application/json",
        },
        body: options?.invalidJSON
            ? "{invalid-json"
            : JSON.stringify(body),
    });
}

function createHarness(options?: {
    session?: { user: { id: string } } | null;
    business?: { id: string } | null;
    failStateCreation?: boolean;
}) {
    const calls = {
        findBusiness: 0,
        createOAuthState: 0,
        buildAuthorizationUrl: 0,
        receivedBusinessId: "",
        receivedUserId: "",
        receivedState: "",
        forceConsent: false,
    };

    const dependencies: GoogleCalendarConnectDependencies = {
        getSession: async () =>
            options?.session === undefined
                ? { user: { id: USER_ID } }
                : options.session,

        findBusiness: async (businessId, userId) => {
            calls.findBusiness++;
            calls.receivedBusinessId = businessId;
            calls.receivedUserId = userId;

            return options?.business === undefined
                ? { id: BUSINESS_ID }
                : options.business;
        },

        createOAuthState: async (userId, businessId) => {
            calls.createOAuthState++;

            assert.equal(userId, USER_ID);
            assert.equal(businessId, BUSINESS_ID);

            if (options?.failStateCreation) {
                throw new Error("Database failure");
            }

            return "test-oauth-state";
        },

        buildAuthorizationUrl: (state, authorizationOptions) => {
            calls.buildAuthorizationUrl++;
            calls.receivedState = state;
            calls.forceConsent =
                authorizationOptions?.forceConsent ?? false;

            return GOOGLE_URL;
        },
    };

    return {
        handler: createGoogleCalendarConnectHandler(dependencies),
        calls,
    };
}

describe("Google Calendar connect handler", () => {
    beforeEach(() => {
        process.env.BETTER_AUTH_URL = BASE_URL;
    });

    afterEach(() => {
        if (ORIGINAL_BASE_URL === undefined) {
            delete process.env.BETTER_AUTH_URL;
        } else {
            process.env.BETTER_AUTH_URL = ORIGINAL_BASE_URL;
        }
    });

    it("rejects a missing origin", async () => {
        const harness = createHarness();
        const request = createRequest(
            { businessId: BUSINESS_ID },
            { origin: "" },
        );

        const response = await harness.handler(request);

        assert.equal(response.status, 403);
        assert.equal(harness.calls.findBusiness, 0);
    });

    it("rejects a cross-origin request", async () => {
        const harness = createHarness();

        const response = await harness.handler(
            createRequest(
                { businessId: BUSINESS_ID },
                { origin: "https://attacker.example" },
            ),
        );

        assert.equal(response.status, 403);
        assert.equal(harness.calls.findBusiness, 0);
    });

    it("rejects unsupported content types", async () => {
        const harness = createHarness();

        const response = await harness.handler(
            createRequest(
                { businessId: BUSINESS_ID },
                { contentType: "text/plain" },
            ),
        );

        assert.equal(response.status, 415);
        assert.equal(harness.calls.findBusiness, 0);
    });

    it("rejects unauthenticated requests", async () => {
        const harness = createHarness({ session: null });

        const response = await harness.handler(createRequest());

        assert.equal(response.status, 401);
        assert.equal(harness.calls.findBusiness, 0);
    });

    it("rejects malformed JSON", async () => {
        const harness = createHarness();

        const response = await harness.handler(
            createRequest(undefined, { invalidJSON: true }),
        );

        assert.equal(response.status, 400);
        assert.equal(harness.calls.findBusiness, 0);
    });

    it("rejects a missing business ID", async () => {
        const harness = createHarness();

        const response = await harness.handler(
            createRequest({}),
        );

        assert.equal(response.status, 400);
        assert.equal(harness.calls.findBusiness, 0);
    });

    it("rejects a business not owned by the authenticated user", async () => {
        const harness = createHarness({ business: null });

        const response = await harness.handler(createRequest());

        assert.equal(response.status, 404);
        assert.equal(harness.calls.findBusiness, 1);
        assert.equal(harness.calls.createOAuthState, 0);
        assert.equal(harness.calls.buildAuthorizationUrl, 0);
    });

    it("creates OAuth state and redirects to Google for a valid request", async () => {
        const harness = createHarness();

        const response = await harness.handler(createRequest());

        assert.equal(response.status, 303);
        assert.equal(response.headers.get("location"), GOOGLE_URL);

        assert.equal(harness.calls.findBusiness, 1);
        assert.equal(harness.calls.receivedBusinessId, BUSINESS_ID);
        assert.equal(harness.calls.receivedUserId, USER_ID);

        assert.equal(harness.calls.createOAuthState, 1);
        assert.equal(harness.calls.buildAuthorizationUrl, 1);
        assert.equal(harness.calls.receivedState, "test-oauth-state");
        assert.equal(harness.calls.forceConsent, true);
    });

    it("returns a safe error when OAuth state creation fails", async () => {
        const harness = createHarness({
            failStateCreation: true,
        });

        const response = await harness.handler(createRequest());

        assert.equal(response.status, 500);

        assert.deepEqual(await response.json(), {
            error: "Unable to start Google Calendar connection.",
        });

        assert.equal(harness.calls.buildAuthorizationUrl, 0);
    });

    it("rejects requests when the application base URL is missing", async () => {
        delete process.env.BETTER_AUTH_URL;

        const harness = createHarness();

        const response = await harness.handler(createRequest());

        assert.equal(response.status, 403);
        assert.equal(harness.calls.findBusiness, 0);
    });
});

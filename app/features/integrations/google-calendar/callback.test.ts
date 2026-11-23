
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createGoogleCalendarCallbackHandler,
  type GoogleCalendarCallbackDependencies,
} from "./callback";

import type {
  GoogleOAuthTokens,
  GoogleAccountIdentity,
} from "./google-oauth-client";

import type {
  GoogleCalendarConnectionMetadata,
  SaveGoogleCalendarConnectionInput,
} from "./connection-core";

const BASE_URL = "http://localhost:3000";
const CALLBACK_URL =
  `${BASE_URL}/api/integrations/google-calendar/callback`;

const USER_ID = "user-1";
const BUSINESS_ID = "business-1";
const STATE = "valid-oauth-state";

const tokens: GoogleOAuthTokens = {
  accessToken: "google-access-token",
  refreshToken: "google-refresh-token",
  expiresAt: new Date("2027-01-01T00:00:00.000Z"),
  scope: "calendar.events calendar.freebusy",
  tokenType: "Bearer",
};

const identity: GoogleAccountIdentity = {
  googleAccountId: "google-account-1",
  email: "owner@example.com",
};

const metadata: GoogleCalendarConnectionMetadata = {
  businessId: BUSINESS_ID,
  googleAccountEmail: identity.email,
  calendarId: null,
  calendarName: null,
  timezone: null,
  isActive: true,
};

function createRequest(parameters: Record<string, string> = {
  code: "authorization-code",
  state: STATE,
}): Request {
  const url = new URL(CALLBACK_URL);

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }

  return new Request(url);
}

function createHarness(options?: {
  session?: { user: { id: string } } | null;
  stateError?: Error;
  exchangeError?: Error;
  identityError?: Error;
  persistenceError?: Error;
}) {
  const calls = {
    getSession: 0,
    consumeState: 0,
    exchangeCode: 0,
    getIdentity: 0,
    saveConnection: 0,
    receivedCode: "",
    receivedState: "",
    receivedUserId: "",
    receivedBusinessId: "",
    receivedAccessToken: "",
    savedInput: null as SaveGoogleCalendarConnectionInput | null,
  };

  const dependencies: GoogleCalendarCallbackDependencies = {
    getSession: async () => {
      calls.getSession++;

      return options?.session === undefined
        ? { user: { id: USER_ID } }
        : options.session;
    },

    consumeOAuthState: async (state, userId) => {
      calls.consumeState++;
      calls.receivedState = state;
      calls.receivedUserId = userId;

      if (options?.stateError) {
        throw options.stateError;
      }

      return { businessId: BUSINESS_ID };
    },

    exchangeAuthorizationCode: async (code) => {
      calls.exchangeCode++;
      calls.receivedCode = code;

      if (options?.exchangeError) {
        throw options.exchangeError;
      }

      return tokens;
    },

    getGoogleAccountIdentity: async (accessToken) => {
      calls.getIdentity++;
      calls.receivedAccessToken = accessToken;

      if (options?.identityError) {
        throw options.identityError;
      }

      return identity;
    },

    saveConnection: async (input) => {
      calls.saveConnection++;
      calls.savedInput = input;
      calls.receivedBusinessId = input.businessId;

      if (options?.persistenceError) {
        throw options.persistenceError;
      }

      return metadata;
    },

    applicationBaseUrl: BASE_URL,
  };

  return {
    handler: createGoogleCalendarCallbackHandler(dependencies),
    calls,
  };
}

function getRedirectStatus(response: Response): string | null {
  const location = response.headers.get("location");

  assert.ok(location);

  const url = new URL(location);

  assert.equal(url.origin, BASE_URL);
  assert.equal(url.pathname, "/integrations/google-calendar");

  return url.searchParams.get("status");
}

describe("Google Calendar OAuth callback", () => {
  it("rejects unauthenticated callbacks without consuming state", async () => {
    const harness = createHarness({ session: null });

    const response = await harness.handler(createRequest());

    assert.equal(response.status, 303);
    assert.equal(getRedirectStatus(response), "error");

    assert.equal(harness.calls.consumeState, 0);
    assert.equal(harness.calls.exchangeCode, 0);
    assert.equal(harness.calls.saveConnection, 0);
  });

  it("rejects callbacks without state", async () => {
    const harness = createHarness();

    const response = await harness.handler(
      createRequest({ code: "authorization-code" }),
    );

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.consumeState, 0);
    assert.equal(harness.calls.exchangeCode, 0);
  });

  it("consumes state using the authenticated user ID", async () => {
    const harness = createHarness();

    await harness.handler(createRequest());

    assert.equal(harness.calls.consumeState, 1);
    assert.equal(harness.calls.receivedState, STATE);
    assert.equal(harness.calls.receivedUserId, USER_ID);
  });

  it("does not exchange a code when OAuth state is invalid or replayed", async () => {
    const harness = createHarness({
      stateError: new Error("Invalid or expired OAuth state."),
    });

    const response = await harness.handler(createRequest());

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.consumeState, 1);
    assert.equal(harness.calls.exchangeCode, 0);
    assert.equal(harness.calls.saveConnection, 0);
  });

  it("handles Google access denial after consuming state", async () => {
    const harness = createHarness();

    const response = await harness.handler(
      createRequest({
        error: "access_denied",
        state: STATE,
      }),
    );

    assert.equal(getRedirectStatus(response), "cancelled");
    assert.equal(harness.calls.consumeState, 1);
    assert.equal(harness.calls.exchangeCode, 0);
    assert.equal(harness.calls.saveConnection, 0);
  });

  it("handles other Google authorization errors safely", async () => {
    const harness = createHarness();

    const response = await harness.handler(
      createRequest({
        error: "server_error",
        state: STATE,
      }),
    );

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.consumeState, 1);
    assert.equal(harness.calls.exchangeCode, 0);
  });

  it("rejects callbacks with a missing authorization code", async () => {
    const harness = createHarness();

    const response = await harness.handler(
      createRequest({ state: STATE }),
    );

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.consumeState, 1);
    assert.equal(harness.calls.exchangeCode, 0);
  });

  it("handles authorization code exchange failures", async () => {
    const harness = createHarness({
      exchangeError: new Error("Google token exchange failed"),
    });

    const response = await harness.handler(createRequest());

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.exchangeCode, 1);
    assert.equal(harness.calls.getIdentity, 0);
    assert.equal(harness.calls.saveConnection, 0);
  });

  it("does not persist credentials when Google identity verification fails", async () => {
    const harness = createHarness({
      identityError: new Error("Google identity verification failed"),
    });

    const response = await harness.handler(createRequest());

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.exchangeCode, 1);
    assert.equal(harness.calls.getIdentity, 1);
    assert.equal(harness.calls.saveConnection, 0);
  });

  it("handles connection persistence failures safely", async () => {
    const harness = createHarness({
      persistenceError: new Error("Database failure"),
    });

    const response = await harness.handler(createRequest());

    assert.equal(getRedirectStatus(response), "error");
    assert.equal(harness.calls.saveConnection, 1);
  });

  it("completes a successful Google Calendar connection", async () => {
    const harness = createHarness();

    const response = await harness.handler(createRequest());

    assert.equal(response.status, 303);
    assert.equal(getRedirectStatus(response), "connected");

    assert.equal(harness.calls.getSession, 1);
    assert.equal(harness.calls.consumeState, 1);
    assert.equal(harness.calls.exchangeCode, 1);
    assert.equal(harness.calls.getIdentity, 1);
    assert.equal(harness.calls.saveConnection, 1);

    assert.equal(
      harness.calls.receivedBusinessId,
      BUSINESS_ID,
    );

    assert.equal(
      harness.calls.receivedAccessToken,
      tokens.accessToken,
    );

    assert.deepEqual(harness.calls.savedInput, {
      businessId: BUSINESS_ID,
      identity,
      tokens,
    });
  });

  it("never leaks OAuth credentials or state into the redirect URL", async () => {
    const harness = createHarness();

    const response = await harness.handler(createRequest());

    const location = response.headers.get("location") ?? "";

    assert.equal(location.includes("authorization-code"), false);
    assert.equal(location.includes("google-access-token"), false);
    assert.equal(location.includes("google-refresh-token"), false);
    assert.equal(location.includes(STATE), false);
  });
});

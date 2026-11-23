
import {
    afterEach,
    beforeEach,
    describe,
    it,
} from "node:test";

import assert from "node:assert/strict";

import {
    exchangeGoogleAuthorizationCode,
    getGoogleAccountIdentity,
    GoogleOAuthError,
} from "./google-oauth-client";

import { GOOGLE_CALENDAR_SCOPES } from "./oauth-config";

const ENV_KEYS = [
    "GOOGLE_CALENDAR_CLIENT_ID",
    "GOOGLE_CALENDAR_CLIENT_SECRET",
    "GOOGLE_CALENDAR_REDIRECT_URI",
] as const;

const originalEnvironment = new Map(
    ENV_KEYS.map((key) => [key, process.env[key]]),
);

function configureEnvironment() {
    process.env.GOOGLE_CALENDAR_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_CALENDAR_REDIRECT_URI =
        "http://localhost:3000/api/integrations/google-calendar/callback";
}

function jsonResponse(
    payload: unknown,
    status = 200,
): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

describe("Google OAuth client", () => {
    beforeEach(() => {
        configureEnvironment();
    });

    afterEach(() => {
        for (const key of ENV_KEYS) {
            const originalValue = originalEnvironment.get(key);

            if (originalValue === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = originalValue;
            }
        }
    });

    describe("authorization code exchange", () => {
        it("exchanges an authorization code for tokens", async () => {
            let capturedUrl = "";
            let capturedInit: RequestInit | undefined;

            const fakeFetch = (async (
                input: RequestInfo | URL,
                init?: RequestInit,
            ) => {
                capturedUrl = input.toString();
                capturedInit = init;

                return jsonResponse({
                    access_token: "test-access-token",
                    refresh_token: "test-refresh-token",
                    expires_in: 3600,
                    token_type: "Bearer",
                    scope: [
                        ...GOOGLE_CALENDAR_SCOPES,
                        "https://www.googleapis.com/auth/userinfo.profile",
                    ].join(" "),
                });
            }) as typeof fetch;

            const result = await exchangeGoogleAuthorizationCode(
                "test-authorization-code",
                fakeFetch,
            );

            assert.equal(
                capturedUrl,
                "https://oauth2.googleapis.com/token",
            );

            assert.equal(capturedInit?.method, "POST");

            const headers = new Headers(capturedInit?.headers);

            assert.equal(
                headers.get("Content-Type"),
                "application/x-www-form-urlencoded",
            );

            const body = new URLSearchParams(
                capturedInit?.body as string,
            );

            assert.equal(
                body.get("code"),
                "test-authorization-code",
            );

            assert.equal(
                body.get("client_id"),
                "test-client-id",
            );

            assert.equal(
                body.get("client_secret"),
                "test-client-secret",
            );

            assert.equal(
                body.get("redirect_uri"),
                process.env.GOOGLE_CALENDAR_REDIRECT_URI,
            );

            assert.equal(
                body.get("grant_type"),
                "authorization_code",
            );

            assert.equal(result.accessToken, "test-access-token");
            assert.equal(result.refreshToken, "test-refresh-token");

            assert.equal(
                result.scope,
                [
                    ...GOOGLE_CALENDAR_SCOPES,
                    "https://www.googleapis.com/auth/userinfo.profile",
                ].join(" "),
            );

            assert.equal(result.tokenType, "Bearer");

            assert.ok(result.expiresAt instanceof Date);
            assert.ok(result.expiresAt.getTime() > Date.now());
        });

        it("accepts a response without a refresh token", async () => {
            const fakeFetch = (async () =>
                jsonResponse({
                    access_token: "test-access-token",
                    expires_in: 3600,
                    token_type: "Bearer",
                    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
                })) as typeof fetch;

            const result = await exchangeGoogleAuthorizationCode(
                "test-code",
                fakeFetch,
            );

            assert.equal(result.refreshToken, null);
        });

        it("rejects an empty authorization code", async () => {
            await assert.rejects(
                exchangeGoogleAuthorizationCode(""),
                GoogleOAuthError,
            );
        });

        it("rejects unsuccessful Google token responses", async () => {
            const fakeFetch = (async () =>
                jsonResponse(
                    {
                        error: "invalid_grant",
                        error_description: "Code expired",
                    },
                    400,
                )) as typeof fetch;

            await assert.rejects(
                exchangeGoogleAuthorizationCode(
                    "expired-code",
                    fakeFetch,
                ),
                {
                    name: "GoogleOAuthError",
                    message: "Google rejected the authorization code.",
                },
            );
        });

        it("rejects malformed token responses", async () => {
            const fakeFetch = (async () =>
                jsonResponse({
                    access_token: "test-access-token",
                    expires_in: -1,
                    token_type: "Bearer",
                    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
                })) as typeof fetch;

            await assert.rejects(
                exchangeGoogleAuthorizationCode(
                    "test-code",
                    fakeFetch,
                ),
                {
                    name: "GoogleOAuthError",
                    message: "Google returned incomplete or invalid token data.",
                },
            );
        });

        it("rejects tokens missing required permissions", async () => {
            const fakeFetch = (async () =>
                jsonResponse({
                    access_token: "test-access-token",
                    refresh_token: "test-refresh-token",
                    expires_in: 3600,
                    token_type: "Bearer",
                    scope: "openid https://www.googleapis.com/auth/userinfo.email",
                })) as typeof fetch;

            await assert.rejects(
                exchangeGoogleAuthorizationCode(
                    "test-code",
                    fakeFetch,
                ),
                {
                    name: "GoogleOAuthError",
                    message: "Google did not grant all required permissions.",
                },
            );
        });

        it("rejects malformed JSON responses", async () => {
            const fakeFetch = (async () =>
                new Response("not-json", {
                    status: 200,
                })) as typeof fetch;

            await assert.rejects(
                exchangeGoogleAuthorizationCode(
                    "test-code",
                    fakeFetch,
                ),
                {
                    name: "GoogleOAuthError",
                    message: "Google returned an invalid response.",
                },
            );
        });

        it("handles network failures without exposing credentials", async () => {
            const fakeFetch = (async () => {
                throw new Error("Network failure");
            }) as typeof fetch;

            await assert.rejects(
                exchangeGoogleAuthorizationCode(
                    "test-code",
                    fakeFetch,
                ),
                {
                    name: "GoogleOAuthError",
                    message: "Unable to reach Google's token service.",
                },
            );
        });
    });

    describe("Google account identity", () => {
        it("retrieves a verified Google account identity", async () => {
            let capturedUrl = "";
            let capturedInit: RequestInit | undefined;

            const fakeFetch = (async (
                input: RequestInfo | URL,
                init?: RequestInit,
            ) => {
                capturedUrl = input.toString();
                capturedInit = init;

                return jsonResponse({
                    sub: "google-account-123",
                    email: "calendar@example.com",
                    email_verified: true,
                });
            }) as typeof fetch;

            const result = await getGoogleAccountIdentity(
                "test-access-token",
                fakeFetch,
            );

            assert.equal(
                capturedUrl,
                "https://openidconnect.googleapis.com/v1/userinfo",
            );

            assert.equal(capturedInit?.method, "GET");

            const headers = new Headers(capturedInit?.headers);

            assert.equal(
                headers.get("Authorization"),
                "Bearer test-access-token",
            );

            assert.deepEqual(result, {
                googleAccountId: "google-account-123",
                email: "calendar@example.com",
            });
        });

        it("rejects an unverified email", async () => {
            const fakeFetch = (async () =>
                jsonResponse({
                    sub: "google-account-123",
                    email: "calendar@example.com",
                    email_verified: false,
                })) as typeof fetch;

            await assert.rejects(
                getGoogleAccountIdentity(
                    "test-access-token",
                    fakeFetch,
                ),
                GoogleOAuthError,
            );
        });

        it("rejects a missing Google account ID", async () => {
            const fakeFetch = (async () =>
                jsonResponse({
                    email: "calendar@example.com",
                    email_verified: true,
                })) as typeof fetch;

            await assert.rejects(
                getGoogleAccountIdentity(
                    "test-access-token",
                    fakeFetch,
                ),
                GoogleOAuthError,
            );
        });

        it("rejects failed identity requests", async () => {
            const fakeFetch = (async () =>
                jsonResponse(
                    { error: "invalid_token" },
                    401,
                )) as typeof fetch;

            await assert.rejects(
                getGoogleAccountIdentity(
                    "test-access-token",
                    fakeFetch,
                ),
                {
                    name: "GoogleOAuthError",
                    message: "Unable to verify the Google account.",
                },
            );
        });

        it("rejects an empty access token", async () => {
            await assert.rejects(
                getGoogleAccountIdentity(""),
                GoogleOAuthError,
            );
        });
    });
});

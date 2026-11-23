
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
    buildGoogleAuthorizationUrl,
    getGoogleCalendarOAuthConfig,
    getGoogleCalendarPublicOAuthConfig,
    GoogleCalendarConfigurationError,
} from "./oauth-config";

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

describe("Google Calendar OAuth configuration", () => {
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

    it("loads public OAuth configuration without exposing the client secret", () => {
        const config = getGoogleCalendarPublicOAuthConfig();

        assert.deepEqual(config, {
            clientId: "test-client-id",
            redirectUri:
                "http://localhost:3000/api/integrations/google-calendar/callback",
        });

        assert.equal("clientSecret" in config, false);
    });

    it("loads complete OAuth configuration", () => {
        const config = getGoogleCalendarOAuthConfig();

        assert.equal(config.clientId, "test-client-id");
        assert.equal(config.clientSecret, "test-client-secret");
        assert.equal(
            config.redirectUri,
            "http://localhost:3000/api/integrations/google-calendar/callback",
        );
    });

    it("rejects missing public OAuth configuration", () => {
        delete process.env.GOOGLE_CALENDAR_CLIENT_ID;

        assert.throws(
            () => getGoogleCalendarPublicOAuthConfig(),
            GoogleCalendarConfigurationError,
        );
    });

    it("requires the client secret only for complete OAuth configuration", () => {
        delete process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

        assert.doesNotThrow(
            () => getGoogleCalendarPublicOAuthConfig(),
        );

        assert.throws(
            () => getGoogleCalendarOAuthConfig(),
            GoogleCalendarConfigurationError,
        );
    });

    it("builds a valid Google authorization URL without requiring the client secret", () => {
        delete process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

        const state = "A".repeat(43);
        const result = new URL(
            buildGoogleAuthorizationUrl(state),
        );

        assert.equal(
            result.origin + result.pathname,
            "https://accounts.google.com/o/oauth2/v2/auth",
        );

        assert.equal(
            result.searchParams.get("client_id"),
            "test-client-id",
        );

        assert.equal(
            result.searchParams.get("redirect_uri"),
            "http://localhost:3000/api/integrations/google-calendar/callback",
        );

        assert.equal(result.searchParams.get("response_type"), "code");
        assert.equal(result.searchParams.get("access_type"), "offline");
        assert.equal(result.searchParams.get("state"), state);

        assert.ok(
            result.searchParams
                .get("scope")
                ?.includes("https://www.googleapis.com/auth/calendar.events"),
        );

        assert.equal(result.searchParams.get("prompt"), null);
    });

    it("adds consent prompt when explicitly requested", () => {
        const result = new URL(
            buildGoogleAuthorizationUrl("A".repeat(43), {
                forceConsent: true,
            }),
        );

        assert.equal(result.searchParams.get("prompt"), "consent");
    });

    it("supports a login hint", () => {
        const result = new URL(
            buildGoogleAuthorizationUrl("A".repeat(43), {
                loginHint: "calendar@example.com",
            }),
        );

        assert.equal(
            result.searchParams.get("login_hint"),
            "calendar@example.com",
        );
    });

    it("rejects malformed OAuth state", () => {
        assert.throws(
            () => buildGoogleAuthorizationUrl("invalid"),
            {
                message: "Invalid OAuth state.",
            },
        );
    });
});

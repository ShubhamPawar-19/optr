
import "server-only";

const GOOGLE_AUTHORIZATION_ENDPOINT =
    "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_CALENDAR_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
    "https://www.googleapis.com/auth/calendar.freebusy",
    "https://www.googleapis.com/auth/calendar.events",
] as const;

export class GoogleCalendarConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GoogleCalendarConfigurationError";
    }
}

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new GoogleCalendarConfigurationError(
            `${name} is not configured.`,
        );
    }

    return value;
}

export function getGoogleCalendarPublicOAuthConfig() {
    return {
        clientId: getRequiredEnvironmentVariable(
            "GOOGLE_CALENDAR_CLIENT_ID",
        ),
        redirectUri: getRequiredEnvironmentVariable(
            "GOOGLE_CALENDAR_REDIRECT_URI",
        ),
    };
}

export function getGoogleCalendarOAuthConfig() {
    return {
        ...getGoogleCalendarPublicOAuthConfig(),
        clientSecret: getRequiredEnvironmentVariable(
            "GOOGLE_CALENDAR_CLIENT_SECRET",
        ),
    };
}

export function buildGoogleAuthorizationUrl(
    state: string,
    options?: {
        forceConsent?: boolean;
        loginHint?: string;
    },
): string {
    if (
        typeof state !== "string" ||
        state.length !== 43 ||
        !/^[A-Za-z0-9_-]+$/.test(state)
    ) {
        throw new Error("Invalid OAuth state.");
    }

    const config = getGoogleCalendarPublicOAuthConfig();

    const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);

    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPES.join(" "));
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("state", state);

    if (options?.forceConsent) {
        url.searchParams.set("prompt", "consent");
    }

    if (options?.loginHint?.trim()) {
        url.searchParams.set("login_hint", options.loginHint.trim());
    }

    return url.toString();
}

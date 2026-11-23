
import "server-only";

import {
    getGoogleCalendarOAuthConfig,
    GOOGLE_CALENDAR_SCOPES,
} from "./oauth-config";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT =
    "https://openidconnect.googleapis.com/v1/userinfo";

const REQUEST_TIMEOUT_MS = 10_000;

export class GoogleOAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GoogleOAuthError";
    }
}

export type GoogleOAuthTokens = {
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date;
    scope: string;
    tokenType: "Bearer";
};

export type GoogleAccountIdentity = {
    googleAccountId: string;
    email: string;
};

type FetchFunction = typeof fetch;

function isObject(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

async function readJsonResponse(
    response: Response,
): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        throw new GoogleOAuthError(
            "Google returned an invalid response.",
        );
    }
}

export async function exchangeGoogleAuthorizationCode(
    authorizationCode: string,
    fetchImpl: FetchFunction = fetch,
): Promise<GoogleOAuthTokens> {
    if (
        typeof authorizationCode !== "string" ||
        !authorizationCode.trim()
    ) {
        throw new GoogleOAuthError(
            "Google authorization code is required.",
        );
    }

    const config = getGoogleCalendarOAuthConfig();

    const body = new URLSearchParams({
        code: authorizationCode,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
    });

    let response: Response;

    try {
        response = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            cache: "no-store",
        });
    } catch {
        throw new GoogleOAuthError(
            "Unable to reach Google's token service.",
        );
    }

    if (!response.ok) {
        throw new GoogleOAuthError(
            "Google rejected the authorization code.",
        );
    }

    const payload = await readJsonResponse(response);

    if (!isObject(payload)) {
        throw new GoogleOAuthError(
            "Google returned an invalid token response.",
        );
    }

    const accessToken = payload.access_token;
    const refreshToken = payload.refresh_token;
    const expiresIn = payload.expires_in;
    const scope = payload.scope;
    const tokenType = payload.token_type;

    if (
        typeof accessToken !== "string" ||
        !accessToken.trim() ||
        typeof expiresIn !== "number" ||
        !Number.isSafeInteger(expiresIn) ||
        expiresIn <= 0 ||
        tokenType !== "Bearer" ||
        typeof scope !== "string" ||
        !scope.trim() ||
        (
            refreshToken !== undefined &&
            (
                typeof refreshToken !== "string" ||
                !refreshToken.trim()
            )
        )
    ) {
        throw new GoogleOAuthError(
            "Google returned incomplete or invalid token data.",
        );
    }

    // Verify that Google granted every permission OPTR requires.
    // Additional granted scopes are allowed.
    const grantedScopes = new Set(scope.split(/\s+/));

    const missingScopes = GOOGLE_CALENDAR_SCOPES.filter(
        (requiredScope) => !grantedScopes.has(requiredScope),
    );

    if (missingScopes.length > 0) {
        throw new GoogleOAuthError(
            "Google did not grant all required permissions.",
        );
    }

    return {
        accessToken,
        refreshToken:
            typeof refreshToken === "string"
                ? refreshToken
                : null,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        scope,
        tokenType: "Bearer",
    };
}

export async function getGoogleAccountIdentity(
    accessToken: string,
    fetchImpl: FetchFunction = fetch,
): Promise<GoogleAccountIdentity> {
    if (
        typeof accessToken !== "string" ||
        !accessToken.trim()
    ) {
        throw new GoogleOAuthError(
            "Google access token is required.",
        );
    }

    let response: Response;

    try {
        response = await fetchImpl(GOOGLE_USERINFO_ENDPOINT, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            cache: "no-store",
        });
    } catch {
        throw new GoogleOAuthError(
            "Unable to retrieve Google account identity.",
        );
    }

    if (!response.ok) {
        throw new GoogleOAuthError(
            "Unable to verify the Google account.",
        );
    }

    const payload = await readJsonResponse(response);

    if (
        !isObject(payload) ||
        typeof payload.sub !== "string" ||
        !payload.sub.trim() ||
        typeof payload.email !== "string" ||
        !payload.email.trim() ||
        payload.email_verified !== true
    ) {
        throw new GoogleOAuthError(
            "Google account identity could not be verified.",
        );
    }

    return {
        googleAccountId: payload.sub,
        email: payload.email.trim(),
    };
}

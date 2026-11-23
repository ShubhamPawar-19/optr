
import type {
  GoogleOAuthTokens,
  GoogleAccountIdentity,
} from "./google-oauth-client";

import type {
  SaveGoogleCalendarConnectionInput,
  GoogleCalendarConnectionMetadata,
} from "./connection-core";

export type GoogleCalendarCallbackDependencies = {
  getSession: () => Promise<{
    user: { id: string };
  } | null>;

  consumeOAuthState: (
    state: string,
    userId: string,
  ) => Promise<{ businessId: string }>;

  exchangeAuthorizationCode: (
    code: string,
  ) => Promise<GoogleOAuthTokens>;

  getGoogleAccountIdentity: (
    accessToken: string,
  ) => Promise<GoogleAccountIdentity>;

  saveConnection: (
    input: SaveGoogleCalendarConnectionInput,
  ) => Promise<GoogleCalendarConnectionMetadata>;

  applicationBaseUrl: string;
};

type CallbackStatus = "connected" | "cancelled" | "error";

function createRedirect(
  baseUrl: string,
  status: CallbackStatus,
): Response {
  const destination = new URL(
    "/integrations/google-calendar",
    baseUrl,
  );

  destination.searchParams.set("status", status);

  return Response.redirect(destination, 303);
}

export function createGoogleCalendarCallbackHandler(
  dependencies: GoogleCalendarCallbackDependencies,
) {
  return async function handleCallback(
    request: Request,
  ): Promise<Response> {
    const errorRedirect = () =>
      createRedirect(dependencies.applicationBaseUrl, "error");

    try {
      const callbackUrl = new URL(request.url);
      const code = callbackUrl.searchParams.get("code");
      const state = callbackUrl.searchParams.get("state");
      const providerError = callbackUrl.searchParams.get("error");

      // Authenticate the OPTR user before consuming OAuth state.
      const session = await dependencies.getSession();

      if (!session?.user?.id) {
        return errorRedirect();
      }

      if (!state) {
        return errorRedirect();
      }

      // Consume state exactly once, even when Google denies access.
      const { businessId } =
        await dependencies.consumeOAuthState(
          state,
          session.user.id,
        );

      if (providerError) {
        return createRedirect(
          dependencies.applicationBaseUrl,
          providerError === "access_denied"
            ? "cancelled"
            : "error",
        );
      }

      if (!code?.trim()) {
        return errorRedirect();
      }

      // Exchange the authorization code for Google credentials.
      const tokens =
        await dependencies.exchangeAuthorizationCode(code);

      // Verify the Google account before saving credentials.
      const identity =
        await dependencies.getGoogleAccountIdentity(
          tokens.accessToken,
        );

      await dependencies.saveConnection({
        businessId,
        identity,
        tokens,
      });

      return createRedirect(
        dependencies.applicationBaseUrl,
        "connected",
      );
    } catch {
      // Never expose OAuth codes, tokens, state, or provider errors.
      return errorRedirect();
    }
  };
}

import { getSession } from "@/app/lib/auth-session";
import { consumeOAuthState } from "@/app/features/integrations/google-calendar/oauth-state";
import {
  exchangeGoogleAuthorizationCode,
  getGoogleAccountIdentity,
} from "@/app/features/integrations/google-calendar/google-oauth-client";
import { saveGoogleCalendarConnection } from "@/app/features/integrations/google-calendar/connection";
import { createGoogleCalendarCallbackHandler } from "@/app/features/integrations/google-calendar/callback";

export const runtime = "nodejs";

const applicationBaseUrl = process.env.BETTER_AUTH_URL;

if (!applicationBaseUrl) {
  throw new Error("BETTER_AUTH_URL is not configured");
}

const handleCallback = createGoogleCalendarCallbackHandler({
  getSession,
  consumeOAuthState,
  exchangeAuthorizationCode: exchangeGoogleAuthorizationCode,
  getGoogleAccountIdentity,
  saveConnection: saveGoogleCalendarConnection,
  applicationBaseUrl,
});

export async function GET(request: Request): Promise<Response> {
  return handleCallback(request);
}
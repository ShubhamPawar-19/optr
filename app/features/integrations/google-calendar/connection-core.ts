
import type { Prisma } from "@/app/generated/prisma/client";

import type {
  GoogleAccountIdentity,
  GoogleOAuthTokens,
} from "./google-oauth-client";

export class GoogleCalendarConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleCalendarConnectionError";
  }
}

export type GoogleCalendarConnectionMetadata = {
  businessId: string;
  googleAccountEmail: string;
  calendarId: string | null;
  calendarName: string | null;
  timezone: string | null;
  isActive: boolean;
};

export type SaveGoogleCalendarConnectionInput = {
  businessId: string;
  identity: GoogleAccountIdentity;
  tokens: GoogleOAuthTokens;
};

export type ConnectionTransaction = Pick<
  Prisma.TransactionClient,
  "googleCalendarConnection"
>;

export type ConnectionDependencies = {
  encrypt: (token: string) => string;
  transaction: <T>(
    operation: (tx: ConnectionTransaction) => Promise<T>,
  ) => Promise<T>;
};

const MAX_TRANSACTION_ATTEMPTS = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function validateInput(
  input: unknown,
): asserts input is SaveGoogleCalendarConnectionInput {
  if (!isRecord(input)) {
    throw new GoogleCalendarConnectionError(
      "Connection input is invalid.",
    );
  }

  const { businessId, identity, tokens } = input;

  if (
    typeof businessId !== "string" ||
    !businessId.trim()
  ) {
    throw new GoogleCalendarConnectionError(
      "Business ID is required.",
    );
  }

  if (
    !isRecord(identity) ||
    typeof identity.googleAccountId !== "string" ||
    !identity.googleAccountId.trim() ||
    typeof identity.email !== "string" ||
    !identity.email.trim()
  ) {
    throw new GoogleCalendarConnectionError(
      "Google account identity is invalid.",
    );
  }

  if (
    !isRecord(tokens) ||
    typeof tokens.accessToken !== "string" ||
    !tokens.accessToken.trim() ||
    !(tokens.expiresAt instanceof Date) ||
    !Number.isFinite(tokens.expiresAt.getTime()) ||
    typeof tokens.scope !== "string" ||
    !tokens.scope.trim() ||
    tokens.tokenType !== "Bearer"
  ) {
    throw new GoogleCalendarConnectionError(
      "Google credentials are invalid.",
    );
  }

  if (
    tokens.refreshToken !== null &&
    (
      typeof tokens.refreshToken !== "string" ||
      !tokens.refreshToken.trim()
    )
  ) {
    throw new GoogleCalendarConnectionError(
      "Google refresh token is invalid.",
    );
  }
}

function isSerializationConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

export function createConnectionService(
  dependencies: ConnectionDependencies,
) {
  return async function saveConnection(
    input: SaveGoogleCalendarConnectionInput,
  ): Promise<GoogleCalendarConnectionMetadata> {
    validateInput(input);

    const { businessId, identity, tokens } = input;

    const encryptedAccessToken = dependencies.encrypt(
      tokens.accessToken,
    );

    const encryptedRefreshToken = tokens.refreshToken
      ? dependencies.encrypt(tokens.refreshToken)
      : null;

    for (
      let attempt = 1;
      attempt <= MAX_TRANSACTION_ATTEMPTS;
      attempt++
    ) {
      try {
        return await dependencies.transaction(async (tx) => {
          const existing =
            await tx.googleCalendarConnection.findUnique({
              where: { businessId },
            });

          const sameGoogleAccount =
            existing?.googleAccountId === identity.googleAccountId;

          const refreshTokenToSave =
            encryptedRefreshToken ??
            (sameGoogleAccount
              ? existing.encryptedRefreshToken
              : null);

          if (!refreshTokenToSave) {
            throw new GoogleCalendarConnectionError(
              "Google did not provide a refresh token. Please reconnect and grant offline access.",
            );
          }

          const calendarSelection = sameGoogleAccount
            ? {
                calendarId: existing.calendarId,
                calendarName: existing.calendarName,
                timezone: existing.timezone,
              }
            : {
                calendarId: null,
                calendarName: null,
                timezone: null,
              };

          return tx.googleCalendarConnection.upsert({
            where: { businessId },
            create: {
              businessId,
              googleAccountId: identity.googleAccountId,
              googleAccountEmail: identity.email,
              encryptedAccessToken,
              encryptedRefreshToken: refreshTokenToSave,
              accessTokenExpiresAt: tokens.expiresAt,
              scope: tokens.scope,
              ...calendarSelection,
              isActive: true,
            },
            update: {
              googleAccountId: identity.googleAccountId,
              googleAccountEmail: identity.email,
              encryptedAccessToken,
              encryptedRefreshToken: refreshTokenToSave,
              accessTokenExpiresAt: tokens.expiresAt,
              scope: tokens.scope,
              ...calendarSelection,
              isActive: true,
            },
            select: {
              businessId: true,
              googleAccountEmail: true,
              calendarId: true,
              calendarName: true,
              timezone: true,
              isActive: true,
            },
          });
        });
      } catch (error) {
        if (
          isSerializationConflict(error) &&
          attempt < MAX_TRANSACTION_ATTEMPTS
        ) {
          continue;
        }

        if (error instanceof GoogleCalendarConnectionError) {
          throw error;
        }

        throw new GoogleCalendarConnectionError(
          "Unable to save the Google Calendar connection.",
        );
      }
    }

    throw new GoogleCalendarConnectionError(
      "Unable to save the Google Calendar connection after multiple attempts.",
    );
  };
}

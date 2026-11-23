
import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";
import { encryptToken } from "@/app/lib/server/encryption/token-encryption";

import { createConnectionService } from "./connection-core";

export {
  GoogleCalendarConnectionError,
} from "./connection-core";

export type {
  GoogleCalendarConnectionMetadata,
  SaveGoogleCalendarConnectionInput,
} from "./connection-core";

export const saveGoogleCalendarConnection =
  createConnectionService({
    encrypt: (token) =>
      encryptToken(token, "GOOGLE_CALENDAR"),

    transaction: (operation) =>
      db.$transaction(
        (tx) => operation(tx),
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
  });

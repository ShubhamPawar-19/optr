
import "server-only";

import {
    createHash,
    randomBytes,
} from "node:crypto";

import { db } from "@/app/lib/db";

const STATE_TTL_MS = 10 * 60 * 1000;
const STATE_BYTE_LENGTH = 32;

export class InvalidOAuthStateError extends Error {
    constructor() {
        super("Invalid or expired OAuth state.");
        this.name = "InvalidOAuthStateError";
    }
}

export type OAuthStateDependencies = {
    findBusiness: (
        userId: string,
        businessId: string,
    ) => Promise<boolean>;

    createState: (data: {
        stateHash: string;
        userId: string;
        businessId: string;
        expiresAt: Date;
    }) => Promise<void>;

    consumeState: (data: {
        stateHash: string;
        userId: string;
        now: Date;
    }) => Promise<string | null>;
};

const defaultDependencies: OAuthStateDependencies = {
    findBusiness: async (userId, businessId) => {
        const business = await db.business.findFirst({
            where: {
                id: businessId,
                ownerId: userId,
            },
            select: {
                id: true,
            },
        });

        return business !== null;
    },

    createState: async (data) => {
        await db.googleCalendarOAuthState.create({
            data,
        });
    },

    consumeState: async ({ stateHash, userId, now }) => {
        return db.$transaction(async (tx) => {
            const pendingState =
                await tx.googleCalendarOAuthState.findFirst({
                    where: {
                        stateHash,
                        userId,
                        consumedAt: null,
                        expiresAt: {
                            gt: now,
                        },
                    },
                    select: {
                        businessId: true,
                    },
                });

            if (!pendingState) {
                return null;
            }

            const result =
                await tx.googleCalendarOAuthState.updateMany({
                    where: {
                        stateHash,
                        userId,
                        businessId: pendingState.businessId,
                        consumedAt: null,
                        expiresAt: {
                            gt: now,
                        },
                    },
                    data: {
                        consumedAt: now,
                    },
                });

            if (result.count !== 1) {
                return null;
            }

            return pendingState.businessId;
        });
    },
};

function hashState(state: string): string {
    return createHash("sha256")
        .update(state, "utf8")
        .digest("hex");
}

export async function createOAuthState(
    userId: string,
    businessId: string,
    dependencies: OAuthStateDependencies = defaultDependencies,
): Promise<string> {
    if (!userId.trim() || !businessId.trim()) {
        throw new Error("User ID and business ID are required.");
    }

    const ownsBusiness = await dependencies.findBusiness(
        userId,
        businessId,
    );

    if (!ownsBusiness) {
        throw new Error("Business access denied.");
    }

    const state = randomBytes(STATE_BYTE_LENGTH).toString("base64url");
    const stateHash = hashState(state);
    const expiresAt = new Date(Date.now() + STATE_TTL_MS);

    await dependencies.createState({
        stateHash,
        userId,
        businessId,
        expiresAt,
    });

    return state;
}

export async function consumeOAuthState(
    state: string,
    userId: string,
    dependencies: OAuthStateDependencies = defaultDependencies,
): Promise<{ businessId: string }> {
    if (
        typeof state !== "string" ||
        state.length !== 43 ||
        !/^[A-Za-z0-9_-]+$/.test(state) ||
        !userId.trim()
    ) {
        throw new InvalidOAuthStateError();
    }

    const businessId = await dependencies.consumeState({
        stateHash: hashState(state),
        userId,
        now: new Date(),
    });

    if (!businessId) {
        throw new InvalidOAuthStateError();
    }

    return { businessId };
}

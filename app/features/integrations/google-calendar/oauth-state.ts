
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
        businessId: string;
        now: Date;
    }) => Promise<number>;
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

    consumeState: async ({ stateHash, userId, businessId, now }) => {
        const result = await db.googleCalendarOAuthState.updateMany({
            where: {
                stateHash,
                userId,
                businessId,
                consumedAt: null,
                expiresAt: {
                    gt: now,
                },
            },
            data: {
                consumedAt: now,
            },
        });

        return result.count;
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
    businessId: string,
    dependencies: OAuthStateDependencies = defaultDependencies,
): Promise<void> {
    if (
        typeof state !== "string" ||
        state.length !== 43 ||
        !/^[A-Za-z0-9_-]+$/.test(state) ||
        !userId.trim() ||
        !businessId.trim()
    ) {
        throw new InvalidOAuthStateError();
    }

    const count = await dependencies.consumeState({
        stateHash: hashState(state),
        userId,
        businessId,
        now: new Date(),
    });

    if (count !== 1) {
        throw new InvalidOAuthStateError();
    }
}

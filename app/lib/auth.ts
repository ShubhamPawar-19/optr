import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/app/lib/db";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be configured with at least 32 characters");
}

if (!baseURL) {
    throw new Error("BETTER_AUTH_URL must be configured");
}

export const auth = betterAuth({
    appName: "OPTR",
    baseURL,
    secret,
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },

    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const existingBusiness = await db.business.findFirst({
                        where: { ownerId: user.id },
                        select: { id: true },
                    });

                    if (!existingBusiness) {
                        await db.business.create({
                            data: {
                                name: `${user.name.trim() || "My"}'s Workspace`,
                                ownerId: user.id,
                            },
                        });
                    }
                },
            },
        },
    },

    trustedOrigins: [baseURL],
});

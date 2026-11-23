import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth-session";

import { createGoogleCalendarConnectHandler } from "@/app/features/integrations/google-calendar/connect";
import { createOAuthState } from "@/app/features/integrations/google-calendar/oauth-state";
import { buildGoogleAuthorizationUrl } from "@/app/features/integrations/google-calendar/oauth-config";

const handleConnect = createGoogleCalendarConnectHandler({
    getSession,

    findBusiness: async (businessId, userId) => {
        const business = await db.business.findFirst({
            where: {
                id: businessId,
                ownerId: userId,
            },
            select: {
                id: true,
            },
        });

        return business;
    },

    createOAuthState,

    buildAuthorizationUrl: buildGoogleAuthorizationUrl,
});

export async function POST(request: Request) {
    const response = await handleConnect(request);

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
}

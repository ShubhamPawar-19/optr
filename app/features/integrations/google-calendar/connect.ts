export type GoogleCalendarConnectDependencies = {
    getSession: () => Promise<{
        user: {
            id: string;
        };
    } | null>;

    findBusiness: (
        businessId: string,
        userId: string,
    ) => Promise<{ id: string } | null>;

    createOAuthState: (
        userId: string,
        businessId: string,
    ) => Promise<string>;

    buildAuthorizationUrl: (
        state: string,
        options?: {
            forceConsent?: boolean;
        },
    ) => string;
};

export function createGoogleCalendarConnectHandler(
    dependencies: GoogleCalendarConnectDependencies,
) {
    return async function handleConnect(request: Request): Promise<Response> {
        const origin = request.headers.get("origin");
        const baseURL = process.env.BETTER_AUTH_URL;

        if (!origin || !baseURL) {
            return Response.json(
                { error: "Invalid request origin." },
                { status: 403 },
            );
        }

        try {
            if (new URL(origin).origin !== new URL(baseURL).origin) {
                return Response.json(
                    { error: "Invalid request origin." },
                    { status: 403 },
                );
            }

        } catch {
            return Response.json(
                { error: "Invalid request origin." },
                { status: 403 },
            );
        }


        if (
            !request.headers
                .get("content-type")
                ?.includes("application/json")
        ) {
            return Response.json(
                { error: "Content-Type must be application/json." },
                { status: 415 },
            );
        }

        try {
            const session = await dependencies.getSession();

            if (!session) {
                return Response.json(
                    { error: "Authentication required." },
                    { status: 401 },
                );
            }

            let body: unknown;

            try {
                body = await request.json();
            } catch {
                return Response.json(
                    { error: "Invalid request body." },
                    { status: 400 },
                );
            }

            if (
                !body ||
                typeof body !== "object" ||
                Array.isArray(body)
            ) {
                return Response.json(
                    { error: "Invalid request." },
                    { status: 400 },
                );
            }

            const businessId = (
                body as Record<string, unknown>
            ).businessId;

            if (
                typeof businessId !== "string" ||
                !businessId.trim()
            ) {
                return Response.json(
                    { error: "Business ID is required." },
                    { status: 400 },
                );
            }

            const business = await dependencies.findBusiness(
                businessId,
                session.user.id,
            );

            if (!business) {
                return Response.json(
                    { error: "Business not found." },
                    { status: 404 },
                );
            }

            const state = await dependencies.createOAuthState(
                session.user.id,
                business.id,
            );

            const authorizationURL =
                dependencies.buildAuthorizationUrl(state, {
                    forceConsent: true,
                });

            return Response.json(
                {
                    authorizationUrl: authorizationURL,
                },
                {
                    status: 200,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                },
            );
        } catch (error) {
            console.error("Google Calendar OAuth initiation failed:", {
                errorType:
                    error instanceof Error ? error.name : "UnknownError",
                errorMessage:
                    error instanceof Error ? error.message : "Unknown failure",
            });

            return Response.json(
                {
                    error: "Unable to start Google Calendar connection.",
                },
                { status: 500 },
            );
        }
    };
}

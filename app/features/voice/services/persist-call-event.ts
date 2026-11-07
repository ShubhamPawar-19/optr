
import { createHash } from "node:crypto";

import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";

import type { VoiceProviderEvent } from "../types";

type PersistCallEventParams = {
    event: VoiceProviderEvent;
    rawBody: string;
    payload: unknown;
};

export async function persistCallEvent(
    params: PersistCallEventParams,
) {
    const { event, rawBody, payload } = params;

    // Generate a deterministic ID from the original webhook body.
    // Identical deliveries will resolve to the same database event.
    const eventHash = createHash("sha256")
        .update(rawBody)
        .digest("hex");

    const eventId = `${event.provider.toLowerCase()}_${eventHash}`;

    // Convert Date and unknown payload values into JSON-compatible data.
    const metadata = {
        provider: event.provider,
        providerCallId: event.providerCallId,
        normalizedEvent: JSON.parse(JSON.stringify(event)),
        rawPayload: JSON.parse(JSON.stringify(payload)),
    } as Prisma.InputJsonValue;

    const result = await db.event.createMany({
        data: [
            {
                id: eventId,
                source: event.provider,
                type: event.type,
                occurredAt: event.occurredAt,
                actor: {
                    fromNumber: event.fromNumber ?? null,
                    toNumber: event.toNumber ?? null,
                },
                content: event.transcript
                    ? { transcript: event.transcript }
                    : undefined,
                metadata,
            },
        ],
        skipDuplicates: true,
    });

    return {
        eventId,
        duplicate: result.count === 0,
    };
}

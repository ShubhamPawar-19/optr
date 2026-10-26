
import { inngest } from "@/app/lib/inngest/client";
import { db } from "@/app/lib/db";
import { decideOutboundRecovery } from "@/app/features/conversations/outbound-recovery";

const STALE_AFTER_MS = 5 * 60 * 1000;
const BATCH_SIZE = 100;

export const recoverStaleOutboundMessages = inngest.createFunction(
    {
        id: "recover-stale-outbound-messages",
        triggers: [{ cron: "*/5 * * * *" }],
    },
    async ({ step }) => {
        const now = new Date();
        const cutoff = new Date(now.getTime() - STALE_AFTER_MS);

        const candidates = await step.run(
            "find-stale-outbound-messages",
            async () =>
                db.message.findMany({
                    where: {
                        role: "ASSISTANT",
                        OR: [
                            {
                                outboundStatus: "SENDING",
                                sendStartedAt: { lte: cutoff },
                            },
                            {
                                outboundStatus: "UNKNOWN",
                                sendStartedAt: { lte: cutoff },
                            },
                        ],
                    },
                    select: {
                        id: true,
                        conversationId: true,
                        outboundStatus: true,
                        sendStartedAt: true,
                    },
                    orderBy: { sendStartedAt: "asc" },
                    take: BATCH_SIZE,
                }),
        );

        const flagged = await step.run(
            "revalidate-stale-outbound-messages",
            async () => {
                const results = [];

                for (const candidate of candidates) {
                    const current = await db.message.findFirst({
                        where: {
                            id: candidate.id,
                            role: "ASSISTANT",
                            outboundStatus: {
                                in: ["SENDING", "UNKNOWN"],
                            },
                            sendStartedAt: { lte: cutoff },
                        },
                        select: {
                            id: true,
                            conversationId: true,
                            outboundStatus: true,
                            sendStartedAt: true,
                        },
                    });

                    if (
                        !current?.sendStartedAt ||
                        !current.outboundStatus
                    ) {
                        continue;
                    }

                    const decision = decideOutboundRecovery({
                        status: current.outboundStatus,
                        createdAt: new Date(current.sendStartedAt),
                        now,
                        staleAfterMs: STALE_AFTER_MS,
                    });

                    if (decision.action !== "investigate") {
                        continue;
                    }

                    results.push({
                        messageId: current.id,
                        conversationId: current.conversationId,
                        status: current.outboundStatus,
                        reason: decision.reason,
                        sendStartedAt: new Date(
                            current.sendStartedAt,
                        ).toISOString(),
                    });
                }

                return results;
            },
        );

        if (flagged.length > 0) {
            console.warn(
                "[outbound-recovery] Stale messages need investigation",
                {
                    count: flagged.length,
                    messages: flagged,
                },
            );
        }

        return {
            scanned: candidates.length,
            flagged: flagged.length,
        };
    },
);

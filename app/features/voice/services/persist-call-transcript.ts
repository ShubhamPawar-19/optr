
import { db } from "@/app/lib/db";
import type { VoiceTranscriptTurn } from "@/app/features/voice/types";

export async function persistCallTranscript(params: {
    conversationId: string;
    provider: string;
    providerCallId: string;
    startedAt: Date | null;
    fallbackTimestamp: Date;
    turns: VoiceTranscriptTurn[];
}) {
    const {
    conversationId,
    provider,
    providerCallId,
    startedAt,
    fallbackTimestamp,
    turns,
} = params;

    // An empty or missing transcript must never erase existing messages.
    if (turns.length === 0) {
        return { persisted: 0, skipped: true };
    }

    const prefix = `${provider.toLowerCase()}:${providerCallId}:turn:`;

    const messages = turns.map((turn, index) => {
        const externalId = `${prefix}${index}`;

        const timestamp =
            typeof turn.startTimeSeconds === "number" &&
            Number.isFinite(turn.startTimeSeconds) &&
            turn.startTimeSeconds >= 0
                ? new Date(
                    (startedAt ?? fallbackTimestamp).getTime() +
                    turn.startTimeSeconds * 1000,
                )
                : fallbackTimestamp;

        return {
            externalId,
            role: turn.role,
            content: turn.content,
            createdAt: timestamp,
        };
    });

    await db.$transaction(
        async (tx) => {
            for (const message of messages) {
                await tx.message.upsert({
                    where: {
                        conversationId_externalId: {
                            conversationId,
                            externalId: message.externalId,
                        },
                    },
                    create: {
                        id: crypto.randomUUID(),
                        conversationId,
                        externalId: message.externalId,
                        role: message.role,
                        content: message.content,
                        createdAt: message.createdAt,
                    },
                    update: {
                        role: message.role,
                        content: message.content,
                        createdAt: message.createdAt,
                    },
                });
            }

            // Remove turns no longer present in this non-empty snapshot.
            await tx.message.deleteMany({
                where: {
                    conversationId,
                    externalId: {
                        startsWith: prefix,
                        notIn: messages.map(
                            (message) => message.externalId,
                        ),
                    },
                },
            });

            // Ensure the conversation appears near the top of the inbox.
            await tx.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });
        },
        {
            maxWait: 10_000,
            timeout: 15_000,
        },
    );

    return {
        persisted: messages.length,
        skipped: false,
    };
}

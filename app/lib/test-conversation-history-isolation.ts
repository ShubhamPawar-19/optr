
import { db } from "./db";
import { getConversationMessages } from "../features/conversations/service";

const AGENT_A = "whatsapp-real-estate-agent";
const AGENT_B = "tenant-history-test-agent";
const CONVERSATION_ID = "tenant-history-test-conversation";

async function main() {
    try {
        await db.conversation.upsert({
            where: {
                id: CONVERSATION_ID,
            },
            update: {
                agentId: AGENT_A,
                channel: "whatsapp",
                externalId: "tenant-history-test-customer",
            },
            create: {
                id: CONVERSATION_ID,
                agentId: AGENT_A,
                channel: "whatsapp",
                externalId: "tenant-history-test-customer",
            },
        });

        await db.message.create({
            data: {
                id: "tenant-history-test-message",
                conversationId: CONVERSATION_ID,
                role: "USER",
                content: "Private message for Agent A",
            },
        });

        const messagesA = await getConversationMessages(
            CONVERSATION_ID,
            AGENT_A,
        );

        console.log("Agent A can read its messages:", messagesA.length === 1);

        let agentBBlocked = false;

        try {
            await getConversationMessages(
                CONVERSATION_ID,
                AGENT_B,
            );
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "Conversation not found"
            ) {
                agentBBlocked = true;
            } else {
                throw error;
            }
        }

        console.log("Agent B is blocked:", agentBBlocked);

        if (messagesA.length !== 1 || !agentBBlocked) {
            throw new Error("CONVERSATION HISTORY ISOLATION TEST FAILED");
        }

        console.log("PASS: Conversation history is isolated by agent.");
    } finally {
        await db.message.deleteMany({
            where: { id: "tenant-history-test-message" },
        });

        await db.conversation.deleteMany({
            where: { id: CONVERSATION_ID },
        });

        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
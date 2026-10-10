
import { db } from "./db";
import { getOrCreateConversation } from "../features/conversations/service";

const AGENT_A = "whatsapp-real-estate-agent";
const AGENT_B = "tenant-isolation-test-agent";
const EXTERNAL_ID = "tenant-isolation-test-customer";
const CHANNEL = "whatsapp";

async function main() {
    try {
        const businessB = await db.business.upsert({
            where: { id: "tenant-isolation-test-business" },
            update: {},
            create: {
                id: "tenant-isolation-test-business",
                name: "Tenant Isolation Test Business",
            },
        });

        await db.agent.upsert({
            where: { id: AGENT_B },
            update: { businessId: businessB.id },
            create: {
                id: AGENT_B,
                businessId: businessB.id,
                name: "Tenant Isolation Test Agent",
                instructions: "Temporary isolation test agent.",
                model: "openai/gpt-4.1-mini",
                isActive: true,
            },
        });

        const conversationA = await getOrCreateConversation({
            agentId: AGENT_A,
            channel: CHANNEL,
            externalId: EXTERNAL_ID,
        });

        const conversationB = await getOrCreateConversation({
            agentId: AGENT_B,
            channel: CHANNEL,
            externalId: EXTERNAL_ID,
        });

        console.log("Agent A conversation:", conversationA.id);
        console.log("Agent B conversation:", conversationB.id);
        console.log(
            "Separate conversations:",
            conversationA.id !== conversationB.id,
        );

        if (conversationA.id === conversationB.id) {
            throw new Error("CONVERSATION ISOLATION TEST FAILED");
        }

        console.log("PASS: Agents receive separate conversations.");
    } finally {
        await db.conversation.deleteMany({
            where: {
                channel: CHANNEL,
                externalId: EXTERNAL_ID,
            },
        });

        await db.agent.deleteMany({
            where: { id: AGENT_B },
        });

        await db.business.deleteMany({
            where: { id: "tenant-isolation-test-business" },
        });

        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
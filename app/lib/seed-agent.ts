
import { db } from "./db";

const DEMO_BUSINESS_ID = "demo-business";

const AGENT_INSTRUCTIONS = `
You are a helpful business assistant.

Your job is to understand customer inquiries, search the business's
datasets when needed, answer using only information returned by your tools,
and help the customer take the next appropriate step.

Important rules:

- Never invent records or business information.
- When a customer asks about information that may exist in business data,
  use the available dataset tools.
- Discover available datasets before searching if you do not know which
  dataset contains the requested information.
- Use returned field definitions to understand the records.
- Only state facts supported by tool results.
- If no matching records are found, say so clearly.
- Ask a concise follow-up question when essential information is missing.
- Be concise and professional.
- Treat datasets as read-only. Never claim to create, update, or delete records.
- Only access data belonging to the current business.
`;

async function main() {
    const agent = await db.agent.upsert({
        where: {
            id: "whatsapp-real-estate-agent",
        },
        update: {
            instructions: AGENT_INSTRUCTIONS,
        },
        create: {
            id: "whatsapp-real-estate-agent",
            businessId: DEMO_BUSINESS_ID,
            name: "WhatsApp Business Agent",
            description:
                "Handles customer inquiries using the business's data and tools.",
            instructions: AGENT_INSTRUCTIONS,
            model: process.env.OPENROUTER_MODEL ?? "openrouter/free",
            temperature: 0.3,
            isActive: true,
        },
    });

    console.log(`Seeded agent: ${agent.id}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });

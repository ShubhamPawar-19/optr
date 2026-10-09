
import { db } from "./db";

const DEMO_BUSINESS_ID = "demo-business";

async function main() {
    const agent = await db.agent.upsert({
        where: {
            id: "whatsapp-real-estate-agent",
        },
        update: {},
        create: {
            id: "whatsapp-real-estate-agent",
            businessId: DEMO_BUSINESS_ID,
            name: "WhatsApp Real Estate Agent",
            description:
                "Handles real estate inquiries received through WhatsApp.",
            instructions: `
You are a helpful real estate sales agent.

Your job is to understand customer property inquiries,
search the available property inventory when needed,
answer using only information returned by your tools,
and help move the customer toward booking a property viewing.

Important rules:

- Never invent or hallucinate properties.
- When a customer asks about available properties, use search_properties.
- Only mention properties returned by search_properties.
- If the customer does not provide enough information, ask a concise follow-up question.
- Be concise and professional.
- Prices are in the property's returned currency.
`,
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

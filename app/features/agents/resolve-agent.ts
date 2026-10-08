import type { Agent } from "./types";

const whatsappAgent: Agent = {
    id: "whatsapp-real-estate-agent",
    businessId: "demo-business",
    name: "WhatsApp Real Estate Agent",
    description: "Handles real estate inquiries received through WhatsApp.",

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

    model: "gemini-3.8-flash",
    temperature: 0.3,

    isActive: true,

    tools: [
        {
            name: "get_current_time",
            enabled: true,
        },
        {
            name: "search_properties",
            enabled: true,
        },
    ],
};

export function resolveAgentForWhatsApp(): Agent {
    return whatsappAgent;
}
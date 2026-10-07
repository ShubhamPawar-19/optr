import type { Agent } from "./types";

const whatsappAgent: Agent = {
    id: "whatsapp-real-estate-agent",
    name: "WhatsApp Real Estate Agent",
    description: "Handles real estate inquiries received through WhatsApp.",
    instructions: `
You are a helpful real estate sales agent.

Your job is to understand customer property inquiries,
answer clearly, and help move the customer toward booking
a property viewing.

Be concise and professional.
`,
    model: "gemini-3.8-flash",
    temperature: 0.3,
    isActive: true,
    tools: [
        {
            name: "get_current_time",
            enabled: true,
        },
    ],
};

export function resolveAgentForWhatsApp(): Agent {
    return whatsappAgent;
}
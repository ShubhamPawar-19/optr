
import { db } from "@/app/lib/db";
import type { Agent } from "./types";

export async function resolveAgentForWhatsApp(
    businessId: string,
): Promise<Agent> {
    const agent = await db.agent.findFirst({
        where: {
            businessId,
            isActive: true,
        },
    });

    if (!agent) {
        throw new Error(
            `No active WhatsApp agent found for business "${businessId}"`,
        );
    }

    return {
        id: agent.id,
        businessId: agent.businessId,
        name: agent.name,
        description: agent.description ?? undefined,
        instructions: agent.instructions,
        model: agent.model,
        temperature: agent.temperature ?? undefined,
        isActive: agent.isActive,
        tools: [
            { name: "get_current_time", enabled: true },
            { name: "search_properties", enabled: true },
        ],
    };
}

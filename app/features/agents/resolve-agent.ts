
import { db } from "@/app/lib/db";
import type { Agent } from "./types";

export async function resolveAgentForWhatsApp(
  businessId: string,
): Promise<Agent> {
  const activeAgents = await db.agent.findMany({
    where: {
      businessId,
      isActive: true,
    },
    take: 2,
  });

  if (activeAgents.length === 0) {
    throw new Error(
      `No active WhatsApp agent found for business "${businessId}"`,
    );
  }

  if (activeAgents.length > 1) {
    throw new Error(
      `Multiple active WhatsApp agents found for business "${businessId}"`,
    );
  }

  const agent = activeAgents[0];

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
      { name: "search_data", enabled: true },
      { name: "list_datasets", enabled: true },
    ],
  };
}

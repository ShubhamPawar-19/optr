"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

const agentSchema = z.object({
  name: z.string().trim().min(2, "Agent name must contain at least 2 characters").max(100),
  description: z.string().trim().max(500).optional(),
  instructions: z.string().trim().min(20, "Add more detailed agent instructions").max(12000),
  model: z.string().trim().min(1).max(200),
  temperature: z.coerce.number().min(0).max(2),
});

export async function createAgent(formData: FormData) {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("Sign in and create a workspace before creating an agent.");
  }

  const parsed = agentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions"),
    model: formData.get("model"),
    temperature: formData.get("temperature"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid agent details.");
  }

  const { name, description, instructions, model, temperature } = parsed.data;

  await db.agent.create({
    data: {
      id: crypto.randomUUID(),
      businessId: business.id,
      name,
      description,
      instructions,
      model,
      temperature,
      isActive: false,
    },
  });

  revalidatePath("/agents");
  redirect("/agents?created=1");
}

export async function setAgentActive(formData: FormData) {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("Workspace not found.");
  }

  const agentId = z.string().min(1).safeParse(formData.get("agentId"));
  const active = z.enum(["true", "false"]).safeParse(formData.get("active"));

  if (!agentId.success || !active.success) {
    throw new Error("Invalid agent update.");
  }

  const result = await db.agent.updateMany({
    where: {
      id: agentId.data,
      businessId: business.id,
    },
    data: {
      isActive: active.data === "true",
    },
  });

  if (result.count === 0) {
    throw new Error("Agent not found in your workspace.");
  }

  revalidatePath("/agents");
  revalidatePath("/conversations");
  revalidatePath("/");
}
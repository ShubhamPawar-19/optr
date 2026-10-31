
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/app/lib/db";
import { requireCurrentBusiness } from "@/app/lib/current-business";

const agentSchema = z.object({
  name: z.string().trim().min(2, "Agent name must contain at least 2 characters").max(100),
  description: z.string().trim().max(500).optional(),
  instructions: z.string().trim().min(20, "Add more detailed agent instructions").max(12000),
  model: z.string().trim().min(1).max(200),
  temperature: z.coerce.number().min(0).max(2),
});

const activationSchema = z.object({
  agentId: z.string().trim().min(1).max(100),
  active: z.enum(["true", "false"]),
});

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function createAgent(formData: FormData) {
  const business = await requireCurrentBusiness();

  const parsed = agentSchema.safeParse({
    name: getString(formData, "name"),
    description: getString(formData, "description") || undefined,
    instructions: getString(formData, "instructions"),
    model: getString(formData, "model"),
    temperature: getString(formData, "temperature"),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid agent details."
    );
  }

  const {
    name,
    description,
    instructions,
    model,
    temperature,
  } = parsed.data;

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
  const business = await requireCurrentBusiness();

  const parsed = activationSchema.safeParse({
    agentId: getString(formData, "agentId"),
    active: getString(formData, "active"),
  });

  if (!parsed.success) {
    throw new Error("Invalid agent update.");
  }

  const result = await db.agent.updateMany({
    where: {
      id: parsed.data.agentId,
      businessId: business.id,
    },
    data: {
      isActive: parsed.data.active === "true",
    },
  });

  if (result.count === 0) {
    throw new Error("Agent not found in your workspace.");
  }

  revalidatePath("/agents");
  revalidatePath("/conversations");
  revalidatePath("/");
}

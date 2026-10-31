import "server-only";

import { db } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth-session";
import { redirect } from "next/navigation";

export async function getCurrentBusiness() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const existingBusiness = await db.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
  });

  if (existingBusiness) {
    return existingBusiness;
  }

  // Provision a workspace for an authenticated user who does not have one.
  return db.business.create({
    data: {
      name: `${session.user.name.trim() || "My"}'s Workspace`,
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function requireCurrentBusiness() {
  const business = await getCurrentBusiness();

  if (!business) {
    redirect("/login");
  }

  return business;
}
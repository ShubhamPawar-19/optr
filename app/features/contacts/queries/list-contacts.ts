
import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function listContacts() {
  const business = await getCurrentBusiness();

  if (!business) {
    return [];
  }

  return db.contact.findMany({
    where: {
      businessId: business.id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          conversations: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

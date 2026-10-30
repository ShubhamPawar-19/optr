
import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function listDatasets() {
  const business = await getCurrentBusiness();

  if (!business) {
    return [];
  }

  return db.dataset.findMany({
    where: {
      businessId: business.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          fields: true,
          records: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

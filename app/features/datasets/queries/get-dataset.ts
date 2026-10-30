
import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function getDataset(datasetId: string) {
  const business = await getCurrentBusiness();

  if (!business) {
    return null;
  }

  return db.dataset.findFirst({
    where: {
      id: datasetId,
      businessId: business.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      fields: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          key: true,
          label: true,
          type: true,
          isRequired: true,
          isSearchable: true,
          options: true,
          position: true,
        },
      },
      records: {
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          data: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          records: true,
        },
      },
    },
  });
}

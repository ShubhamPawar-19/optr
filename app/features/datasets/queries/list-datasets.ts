import "server-only";

import { db } from "@/app/lib/db";

const DEMO_BUSINESS_ID = "demo-business";

export async function listDatasets() {
  return db.dataset.findMany({
    where: {
      businessId: DEMO_BUSINESS_ID,
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
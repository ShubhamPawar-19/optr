import "server-only";

import { db } from "@/app/lib/db";

const DEMO_BUSINESS_ID = "demo-business";

export async function getDatasetRecord(
  datasetId: string,
  recordId: string,
) {
  return db.datasetRecord.findFirst({
    where: {
      id: recordId,
      datasetId,
      dataset: {
        businessId: DEMO_BUSINESS_ID,
      },
    },
    select: {
      id: true,
      datasetId: true,
      data: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
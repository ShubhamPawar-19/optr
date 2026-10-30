
import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function getDatasetRecord(
  datasetId: string,
  recordId: string,
) {
  const business = await getCurrentBusiness();

  if (!business) {
    return null;
  }

  return db.datasetRecord.findFirst({
    where: {
      id: recordId,
      datasetId,
      dataset: {
        businessId: business.id,
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


import { db } from "@/app/lib/db";

type DeleteDatasetRecordInput = {
  businessId: string;
  datasetId: string;
  recordId: string;
};

export type DeleteDatasetRecordResult =
  | { success: true }
  | {
      success: false;
      code: "RECORD_NOT_FOUND";
      message: string;
    };

export async function deleteDatasetRecord(
  input: DeleteDatasetRecordInput,
): Promise<DeleteDatasetRecordResult> {
  const { businessId, datasetId, recordId } = input;

  const result = await db.datasetRecord.deleteMany({
    where: {
      id: recordId,
      datasetId,
      dataset: {
        businessId,
      },
    },
  });

  if (result.count === 0) {
    return {
      success: false,
      code: "RECORD_NOT_FOUND",
      message: "Record not found for this dataset and business.",
    };
  }

  return { success: true };
}


import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";

import {
  validateDatasetRecord,
  type DatasetFieldDefinition,
  type RecordValidationError,
} from "../validation/validate-record";

type UpdateDatasetRecordInput = {
  businessId: string;
  datasetId: string;
  recordId: string;
  data: unknown;
};

export type UpdateDatasetRecordResult =
  | { success: true }
  | {
      success: false;
      code: "RECORD_NOT_FOUND" | "VALIDATION_FAILED";
      message: string;
      errors?: RecordValidationError[];
    };

export async function updateDatasetRecord(
  input: UpdateDatasetRecordInput,
): Promise<UpdateDatasetRecordResult> {
  const { businessId, datasetId, recordId, data } = input;

  const record = await db.datasetRecord.findFirst({
    where: {
      id: recordId,
      datasetId,
      dataset: {
        businessId,
      },
    },
    select: {
      id: true,
      dataset: {
        select: {
          fields: {
            select: {
              key: true,
              label: true,
              type: true,
              isRequired: true,
              options: true,
            },
          },
        },
      },
    },
  });

  if (!record) {
    return {
      success: false,
      code: "RECORD_NOT_FOUND",
      message: "Record not found for this dataset and business.",
    };
  }

  const fields: DatasetFieldDefinition[] =
    record.dataset.fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      isRequired: field.isRequired,
      options: field.options,
    }));

  const validation = validateDatasetRecord(fields, data);

  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Record data does not match the dataset schema.",
      errors: validation.errors,
    };
  }

  await db.datasetRecord.update({
    where: {
      id: record.id,
    },
    data: {
      data: validation.data as Prisma.InputJsonValue,
    },
  });

  return { success: true };
}

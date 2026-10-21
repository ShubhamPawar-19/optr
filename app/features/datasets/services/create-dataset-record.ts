
import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";
import {
  validateDatasetRecord,
  type DatasetFieldDefinition,
  type RecordValidationError,
} from "../validation/validate-record";

type CreateDatasetRecordInput = {
  businessId: string;
  datasetId: string;
  data: unknown;
};

export type CreateDatasetRecordResult =
  | {
      success: true;
      recordId: string;
    }
  | {
      success: false;
      code: "DATASET_NOT_FOUND" | "VALIDATION_FAILED";
      message: string;
      errors?: RecordValidationError[];
    };

export async function createDatasetRecord(
  input: CreateDatasetRecordInput,
): Promise<CreateDatasetRecordResult> {
  const { businessId, datasetId, data } = input;

  const dataset = await db.dataset.findFirst({
    where: {
      id: datasetId,
      businessId,
    },
    select: {
      id: true,
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
  });

  if (!dataset) {
    return {
      success: false,
      code: "DATASET_NOT_FOUND",
      message: "Dataset not found for this business.",
    };
  }

  const fields: DatasetFieldDefinition[] = dataset.fields.map((field) => ({
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

  const record = await db.datasetRecord.create({
    data: {
      datasetId: dataset.id,
      data: validation.data as Prisma.InputJsonValue,
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    recordId: record.id,
  };
}

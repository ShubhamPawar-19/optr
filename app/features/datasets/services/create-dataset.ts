
import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";

export interface CreateDatasetFieldInput {
  label: string;
  key: string;
  type: DatasetFieldType;
  isRequired: boolean;
  isSearchable: boolean;
  options?: string[];
}

export interface CreateDatasetInput {
  businessId: string;
  name: string;
  description?: string;
  fields: CreateDatasetFieldInput[];
}

export type CreateDatasetResult =
  | { success: true; datasetId: string }
  | {
      success: false;
      code: "INVALID_INPUT" | "NAME_TAKEN";
      message: string;
    };

const VALID_FIELD_TYPES = new Set<string>([
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "URL",
  "MEDIA",
]);

export async function createDataset(
  input: CreateDatasetInput,
): Promise<CreateDatasetResult> {
  const name = input.name.trim();
  const description = input.description?.trim() || undefined;

  if (!input.businessId.trim() || !name) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Business and dataset name are required.",
    };
  }

  if (!Array.isArray(input.fields) || input.fields.length === 0) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Add at least one field to the dataset.",
    };
  }

  const seenKeys = new Set<string>();

  for (const field of input.fields) {
    if (
      !field.label.trim() ||
      !/^[a-z][a-z0-9_]*$/.test(field.key) ||
      !VALID_FIELD_TYPES.has(field.type)
    ) {
      return {
        success: false,
        code: "INVALID_INPUT",
        message: "Each field needs a label, a valid key, and a supported type.",
      };
    }

    if (seenKeys.has(field.key)) {
      return {
        success: false,
        code: "INVALID_INPUT",
        message: `Duplicate field key: ${field.key}`,
      };
    }

    seenKeys.add(field.key);

    if (
      field.type === "SINGLE_SELECT" ||
      field.type === "MULTI_SELECT"
    ) {
      const options = field.options ?? [];
      const normalized = options.map((option) => option.trim());

      if (
        normalized.length === 0 ||
        normalized.some((option) => !option) ||
        new Set(normalized).size !== normalized.length
      ) {
        return {
          success: false,
          code: "INVALID_INPUT",
          message: `Field "${field.label}" needs unique, non-empty select options.`,
        };
      }
    }
  }

  try {
    const dataset = await db.dataset.create({
      data: {
        businessId: input.businessId,
        name,
        description,
        fields: {
          create: input.fields.map((field, position) => ({
            label: field.label.trim(),
            key: field.key,
            type: field.type,
            isRequired: field.isRequired,
            isSearchable: field.isSearchable,
            position,
            options:
              field.type === "SINGLE_SELECT" ||
              field.type === "MULTI_SELECT"
                ? (field.options ?? []).map((option) => option.trim()) as Prisma.InputJsonValue
                : Prisma.DbNull,
          })),
        },
      },
      select: { id: true },
    });

    return { success: true, datasetId: dataset.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        code: "NAME_TAKEN",
        message: "A dataset with this name already exists.",
      };
    }

    throw error;
  }
}

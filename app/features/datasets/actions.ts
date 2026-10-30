
"use server";

import { updateDatasetRecord } from "./services/update-dataset-record";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import { deleteDatasetRecord } from "./services/delete-dataset-record";
import { createDataset } from "./services/create-dataset";
import { createDatasetRecord } from "./services/create-dataset-record";
import { updateDatasetSchema } from "./services/update-dataset-schema";
import { getCurrentBusiness } from "@/app/lib/current-business";

const FIELD_TYPES = new Set<string>([
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "URL",
  "MEDIA",
]);

export type CreateDatasetActionState = {
  error?: string;
};

export async function createDatasetAction(
  _previousState: CreateDatasetActionState,
  formData: FormData,
): Promise<CreateDatasetActionState> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { error: "Your account is not linked to a business yet." };
  }

  const name = formData.get("name");
  const description = formData.get("description");
  const fieldsJson = formData.get("fields");

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof fieldsJson !== "string"
  ) {
    return { error: "Invalid form submission." };
  }

  let rawFields: unknown;

  try {
    rawFields = JSON.parse(fieldsJson);
  } catch {
    return { error: "Invalid field configuration." };
  }

  if (!Array.isArray(rawFields) || rawFields.length === 0) {
    return { error: "Add at least one field." };
  }

  const fields = [];

  for (const rawField of rawFields) {
    if (
      !rawField ||
      typeof rawField !== "object" ||
      Array.isArray(rawField)
    ) {
      return { error: "Invalid field configuration." };
    }

    const field = rawField as Record<string, unknown>;

    if (
      typeof field.label !== "string" ||
      typeof field.key !== "string" ||
      typeof field.type !== "string" ||
      !FIELD_TYPES.has(field.type) ||
      typeof field.isRequired !== "boolean" ||
      typeof field.isSearchable !== "boolean"
    ) {
      return { error: "One or more fields have invalid values." };
    }

    if (
      field.options !== undefined &&
      (!Array.isArray(field.options) ||
        !field.options.every((option) => typeof option === "string"))
    ) {
      return { error: "Invalid select options." };
    }

    fields.push({
      label: field.label,
      key: field.key,
      type: field.type as DatasetFieldType,
      isRequired: field.isRequired,
      isSearchable: field.isSearchable,
      options: field.options as string[] | undefined,
    });
  }

  const result = await createDataset({
    businessId: business.id,
    name,
    description,
    fields,
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/datasets");
  redirect(`/datasets/${result.datasetId}`);
}

export type CreateRecordActionState = {
  error?: string;
  fieldErrors?: { field: string; message: string }[];
};

export async function createDatasetRecordAction(
  _previousState: CreateRecordActionState,
  formData: FormData,
): Promise<CreateRecordActionState> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { error: "Your account is not linked to a business yet." };
  }

  const datasetId = formData.get("datasetId");
  const dataJson = formData.get("data");

  if (
    typeof datasetId !== "string" ||
    !datasetId.trim() ||
    typeof dataJson !== "string"
  ) {
    return { error: "Invalid form submission." };
  }

  let data: unknown;

  try {
    data = JSON.parse(dataJson);
  } catch {
    return { error: "Invalid record data." };
  }

  const result = await createDatasetRecord({
    businessId: business.id,
    datasetId,
    data,
  });

  if (!result.success) {
    return {
      error: result.message,
      fieldErrors: result.errors,
    };
  }

  revalidatePath(`/datasets/${datasetId}`);
  revalidatePath("/datasets");

  redirect(`/datasets/${datasetId}`);
}

export type UpdateRecordActionState = {
  error?: string;
  fieldErrors?: { field: string; message: string }[];
};

export async function updateDatasetRecordAction(
  _previousState: UpdateRecordActionState,
  formData: FormData,
): Promise<UpdateRecordActionState> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { error: "Your account is not linked to a business yet." };
  }

  const datasetId = formData.get("datasetId");
  const recordId = formData.get("recordId");
  const dataJson = formData.get("data");

  if (
    typeof datasetId !== "string" ||
    !datasetId.trim() ||
    typeof recordId !== "string" ||
    !recordId.trim() ||
    typeof dataJson !== "string"
  ) {
    return { error: "Invalid form submission." };
  }

  let data: unknown;

  try {
    data = JSON.parse(dataJson);
  } catch {
    return { error: "Invalid record data." };
  }

  const result = await updateDatasetRecord({
    businessId: business.id,
    datasetId,
    recordId,
    data,
  });

  if (!result.success) {
    return {
      error: result.message,
      fieldErrors: result.errors,
    };
  }

  revalidatePath(`/datasets/${datasetId}`);
  redirect(`/datasets/${datasetId}`);
}

export type DeleteRecordActionState = {
  error?: string;
};

export async function deleteDatasetRecordAction(
  _previousState: DeleteRecordActionState,
  formData: FormData,
): Promise<DeleteRecordActionState> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { error: "Your account is not linked to a business yet." };
  }

  const datasetId = formData.get("datasetId");
  const recordId = formData.get("recordId");

  if (
    typeof datasetId !== "string" ||
    !datasetId.trim() ||
    typeof recordId !== "string" ||
    !recordId.trim()
  ) {
    return { error: "Invalid form submission." };
  }

  const result = await deleteDatasetRecord({
    businessId: business.id,
    datasetId,
    recordId,
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath(`/datasets/${datasetId}`);
  revalidatePath("/datasets");

  redirect(`/datasets/${datasetId}`);
}

export type UpdateDatasetSchemaActionState = {
  error?: string;
};

export async function updateDatasetSchemaAction(
  _previousState: UpdateDatasetSchemaActionState,
  formData: FormData,
): Promise<UpdateDatasetSchemaActionState> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { error: "Your account is not linked to a business yet." };
  }

  const datasetId = formData.get("datasetId");
  const fieldsJson = formData.get("fields");

  if (
    typeof datasetId !== "string" ||
    !datasetId.trim() ||
    typeof fieldsJson !== "string"
  ) {
    return { error: "Invalid form submission." };
  }

  let rawFields: unknown;

  try {
    rawFields = JSON.parse(fieldsJson);
  } catch {
    return { error: "Invalid schema configuration." };
  }

  if (!Array.isArray(rawFields) || rawFields.length === 0) {
    return { error: "A dataset must have at least one field." };
  }

  const fields = [];

  for (const rawField of rawFields) {
    if (
      !rawField ||
      typeof rawField !== "object" ||
      Array.isArray(rawField)
    ) {
      return { error: "Invalid field configuration." };
    }

    const field = rawField as Record<string, unknown>;

    if (
      typeof field.label !== "string" ||
      typeof field.key !== "string" ||
      typeof field.type !== "string" ||
      !FIELD_TYPES.has(field.type) ||
      typeof field.isRequired !== "boolean" ||
      typeof field.isSearchable !== "boolean" ||
      (field.id !== undefined && typeof field.id !== "string")
    ) {
      return { error: "One or more fields have invalid values." };
    }

    if (
      field.options !== undefined &&
      (!Array.isArray(field.options) ||
        !field.options.every((option) => typeof option === "string"))
    ) {
      return { error: "Invalid select options." };
    }

    fields.push({
      id: field.id as string | undefined,
      label: field.label,
      key: field.key,
      type: field.type as DatasetFieldType,
      isRequired: field.isRequired,
      isSearchable: field.isSearchable,
      options: field.options as string[] | undefined,
    });
  }

  const result = await updateDatasetSchema({
    businessId: business.id,
    datasetId,
    fields,
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/datasets");
  revalidatePath(`/datasets/${datasetId}`);
  revalidatePath(`/datasets/${datasetId}/records`);

  redirect(`/datasets/${datasetId}`);
}

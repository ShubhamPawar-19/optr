
"use server";

import { revalidatePath } from "next/cache";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import {
  createContactField,
  updateContactField,
  setContactFieldActive,
} from "./services/contact-fields";

const DEMO_BUSINESS_ID = "demo-business";

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

export type ContactFieldActionState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

function readBoolean(value: string | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function readFieldType(value: string | null): DatasetFieldType | null {
  if (!value || !FIELD_TYPES.has(value)) return null;
  return value as DatasetFieldType;
}

export async function createContactFieldAction(
  _previousState: ContactFieldActionState,
  formData: FormData,
): Promise<ContactFieldActionState> {
  const label = readString(formData, "label");
  const key = readString(formData, "key");
  const description = readString(formData, "description");
  const type = readFieldType(readString(formData, "type"));
  const isRequired = readBoolean(readString(formData, "isRequired"));

  if (
    !label ||
    !key ||
    !type ||
    isRequired === null ||
    label.length > 100 ||
    key.length > 100 ||
    (description && description.length > 500)
  ) {
    return { error: "Check the field details and try again." };
  }

  const result = await createContactField({
    businessId: DEMO_BUSINESS_ID,
    field: {
      label,
      key,
      description: description || undefined,
      type,
      isRequired,
    },
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/contacts");
  revalidatePath("/contacts/fields");

  return { success: "Contact field created." };
}

export async function updateContactFieldAction(
  _previousState: ContactFieldActionState,
  formData: FormData,
): Promise<ContactFieldActionState> {
  const id = readString(formData, "id");
  const label = readString(formData, "label");
  const description = readString(formData, "description");
  const type = readFieldType(readString(formData, "type"));
  const isRequired = readBoolean(readString(formData, "isRequired"));

  if (
    !id ||
    !label ||
    !type ||
    isRequired === null ||
    label.length > 100 ||
    (description && description.length > 500)
  ) {
    return { error: "Check the field details and try again." };
  }

  const result = await updateContactField({
    businessId: DEMO_BUSINESS_ID,
    field: {
      id,
      label,
      description: description || undefined,
      type,
      isRequired,
    },
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/contacts");
  revalidatePath("/contacts/fields");

  return { success: "Contact field updated." };
}

export async function toggleContactFieldAction(
  _previousState: ContactFieldActionState,
  formData: FormData,
): Promise<ContactFieldActionState> {
  const fieldId = readString(formData, "fieldId");
  const isActive = readBoolean(readString(formData, "isActive"));

  if (!fieldId || isActive === null) {
    return { error: "Invalid field status." };
  }

  const result = await setContactFieldActive({
    businessId: DEMO_BUSINESS_ID,
    fieldId,
    isActive,
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/contacts");
  revalidatePath("/contacts/fields");

  return {
    success: isActive ? "Contact field activated." : "Contact field deactivated.",
  };
}

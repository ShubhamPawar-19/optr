
"use server";

import { revalidatePath } from "next/cache";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import { getCurrentBusiness } from "@/app/lib/current-business";
import {
  createContactField,
  updateContactField,
  setContactFieldActive,
  deleteContactField,
} from "./services/contact-fields";

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

async function getBusinessIdOrError(): Promise<
  { businessId: string; error?: never } |
  { businessId?: never; error: string }
> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { error: "Please sign in and set up your business first." };
  }

  return { businessId: business.id };
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

  const access = await getBusinessIdOrError();
  if (!access.businessId) return { error: access.error };

  const result = await createContactField({
    businessId: access.businessId,
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

  const access = await getBusinessIdOrError();
  if (!access.businessId) return { error: access.error };

  const result = await updateContactField({
    businessId: access.businessId,
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

  const access = await getBusinessIdOrError();
  if (!access.businessId) return { error: access.error };

  const result = await setContactFieldActive({
    businessId: access.businessId,
    fieldId,
    isActive,
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/contacts");
  revalidatePath("/contacts/fields");

  return {
    success: isActive
      ? "Contact field activated."
      : "Contact field deactivated.",
  };
}

export async function deleteContactFieldAction(
  _previousState: ContactFieldActionState,
  formData: FormData,
): Promise<ContactFieldActionState> {
  const fieldId = readString(formData, "fieldId");

  if (!fieldId) {
    return { error: "Invalid contact field." };
  }

  const access = await getBusinessIdOrError();
  if (!access.businessId) return { error: access.error };

  try {
    const result = await deleteContactField({
      businessId: access.businessId,
      fieldId,
    });

    if (!result.success) {
      return { error: result.message };
    }

    revalidatePath("/contacts");
    revalidatePath("/contacts/fields");

    return { success: "Contact field deleted successfully." };
  } catch (error) {
    console.error("Failed to delete contact field:", error);
    return { error: "Unable to delete this field. Please try again." };
  }
}

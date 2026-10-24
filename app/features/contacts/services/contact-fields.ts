
import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";

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

export type ContactFieldInput = {
  label: string;
  key: string;
  description?: string;
  type: DatasetFieldType;
  isRequired: boolean;
};

export type UpdateContactFieldInput = {
  id: string;
  label: string;
  description?: string;
  type: DatasetFieldType;
  isRequired: boolean;
};

export type ContactFieldResult =
  | { success: true; fieldId: string }
  | {
      success: false;
      code: "INVALID_INPUT" | "KEY_TAKEN" | "NOT_FOUND";
      message: string;
    };

export async function listContactFields(businessId: string) {
  return db.contactField.findMany({
    where: { businessId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      key: true,
      label: true,
      description: true,
      type: true,
      isRequired: true,
      isActive: true,
      position: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { values: true },
      },
    },
  });
}

export async function createContactField(input: {
  businessId: string;
  field: ContactFieldInput;
}): Promise<ContactFieldResult> {
  const { businessId, field } = input;
  const label = field.label.trim();
  const key = field.key.trim();
  const description = field.description?.trim() || null;

  if (
    !businessId.trim() ||
    !label ||
    label.length > 100 ||
    !/^[a-z][a-z0-9_]*$/.test(key) ||
    key.length > 100 ||
    !VALID_FIELD_TYPES.has(field.type)
  ) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Enter a valid label, key, and field type.",
    };
  }

  try {
    const created = await db.contactField.create({
      data: {
        businessId,
        key,
        label,
        description,
        type: field.type,
        isRequired: field.isRequired,
        position: await getNextPosition(businessId),
      },
      select: { id: true },
    });

    return { success: true, fieldId: created.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        code: "KEY_TAKEN",
        message: "A contact field with this key already exists.",
      };
    }

    throw error;
  }
}

export async function updateContactField(input: {
  businessId: string;
  field: UpdateContactFieldInput;
}): Promise<ContactFieldResult> {
  const { businessId, field } = input;
  const label = field.label.trim();
  const description = field.description?.trim() || null;

  if (
    !businessId.trim() ||
    !field.id.trim() ||
    !label ||
    label.length > 100 ||
    !VALID_FIELD_TYPES.has(field.type)
  ) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Enter a valid label and field type.",
    };
  }

  const existing = await db.contactField.findFirst({
    where: {
      id: field.id,
      businessId,
    },
    select: { id: true },
  });

  if (!existing) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Contact field not found.",
    };
  }

  await db.contactField.update({
    where: { id: existing.id },
    data: {
      label,
      description,
      type: field.type,
      isRequired: field.isRequired,
    },
  });

  return { success: true, fieldId: existing.id };
}

export async function setContactFieldActive(input: {
  businessId: string;
  fieldId: string;
  isActive: boolean;
}): Promise<ContactFieldResult> {
  const { businessId, fieldId, isActive } = input;

  if (!businessId.trim() || !fieldId.trim()) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Invalid contact field.",
    };
  }

  const existing = await db.contactField.findFirst({
    where: {
      id: fieldId,
      businessId,
    },
    select: { id: true },
  });

  if (!existing) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Contact field not found.",
    };
  }

  await db.contactField.update({
    where: { id: existing.id },
    data: { isActive },
  });

  return { success: true, fieldId: existing.id };
}

async function getNextPosition(businessId: string): Promise<number> {
  const lastField = await db.contactField.findFirst({
    where: { businessId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return (lastField?.position ?? -1) + 1;
}

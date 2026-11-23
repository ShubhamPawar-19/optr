
import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";

const VALID_FIELD_TYPES = new Set<string>([
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "URL",
  "MEDIA",
]);

export type LeadFieldResult =
  | { success: true; fieldId: string }
  | {
      success: false;
      code: "INVALID_INPUT" | "KEY_TAKEN" | "NOT_FOUND" | "IN_USE";
      message: string;
    };

export type LeadFieldInput = {
  label: string;
  key: string;
  description?: string;
  type: DatasetFieldType;
  isRequired: boolean;
};

export type UpdateLeadFieldInput = {
  id: string;
  label: string;
  description?: string;
  type: DatasetFieldType;
  isRequired: boolean;
};

export async function listLeadFields(businessId: string) {
  return db.leadField.findMany({
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

export async function createLeadField(input: {
  businessId: string;
  field: LeadFieldInput;
}): Promise<LeadFieldResult> {
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
      message: "Enter a valid label, key, and supported field type.",
    };
  }

  try {
    const created = await db.leadField.create({
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
        message: "A lead field with this key already exists.",
      };
    }

    throw error;
  }
}

export async function updateLeadField(input: {
  businessId: string;
  field: UpdateLeadFieldInput;
}): Promise<LeadFieldResult> {
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
      message: "Enter a valid label and supported field type.",
    };
  }

  const existing = await db.leadField.findFirst({
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
      message: "Lead field not found.",
    };
  }

  await db.leadField.update({
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

export async function setLeadFieldActive(input: {
  businessId: string;
  fieldId: string;
  isActive: boolean;
}): Promise<LeadFieldResult> {
  const { businessId, fieldId, isActive } = input;

  if (!businessId.trim() || !fieldId.trim()) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Invalid lead field.",
    };
  }

  const existing = await db.leadField.findFirst({
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
      message: "Lead field not found.",
    };
  }

  await db.leadField.update({
    where: { id: existing.id },
    data: { isActive },
  });

  return { success: true, fieldId: existing.id };
}

export async function deleteLeadField(input: {
  businessId: string;
  fieldId: string;
}): Promise<LeadFieldResult> {
  const { businessId, fieldId } = input;

  if (!businessId.trim() || !fieldId.trim()) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Invalid lead field.",
    };
  }

  return db.$transaction(async (tx) => {
    const existing = await tx.leadField.findFirst({
      where: {
        id: fieldId,
        businessId,
      },
      select: {
        id: true,
        _count: {
          select: { values: true },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        code: "NOT_FOUND",
        message: "Lead field not found.",
      };
    }

    if (existing._count.values > 0) {
      return {
        success: false,
        code: "IN_USE",
        message:
          "This field has saved lead data or history. Deactivate it instead to preserve that information.",
      };
    }

    await tx.leadField.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      fieldId: existing.id,
    };
  });
}

async function getNextPosition(businessId: string): Promise<number> {
  const lastField = await db.leadField.findFirst({
    where: { businessId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return (lastField?.position ?? -1) + 1;
}

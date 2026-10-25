import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { DatasetFieldType } from "@/app/generated/prisma/client";
import { db } from "@/app/lib/db";

export interface UpdateDatasetSchemaFieldInput {
    id?: string;
    label: string;
    key: string;
    type: DatasetFieldType;
    isRequired: boolean;
    isSearchable: boolean;
    options?: string[];
}

interface UpdateDatasetSchemaInput {
    businessId: string;
    datasetId: string;
    fields: UpdateDatasetSchemaFieldInput[];
}

export type UpdateDatasetSchemaResult =
    | { success: true }
    | {
        success: false;
        code:
        | "DATASET_NOT_FOUND"
        | "INVALID_INPUT"
        | "FIELD_TYPE_CHANGE"
        | "INVALID_EXISTING_DATA";
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

function isObject(
    value: Prisma.JsonValue,
): value is Prisma.JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function updateDatasetSchema(
    input: UpdateDatasetSchemaInput,
): Promise<UpdateDatasetSchemaResult> {
    const { businessId, datasetId, fields } = input;

    if (
        !businessId.trim() ||
        !datasetId.trim() ||
        !Array.isArray(fields) ||
        fields.length === 0
    ) {
        return {
            success: false,
            code: "INVALID_INPUT",
            message: "A dataset and at least one schema field are required.",
        };
    }

    const seenKeys = new Set<string>();

    for (const field of fields) {
        if (
            !field.label.trim() ||
            !/^[a-z][a-z0-9_]*$/.test(field.key) ||
            !VALID_FIELD_TYPES.has(field.type)
        ) {
            return {
                success: false,
                code: "INVALID_INPUT",
                message: "Every field needs a label, valid key, and supported type.",
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
            const options = (field.options ?? []).map((option) => option.trim());

            if (
                options.length === 0 ||
                options.some((option) => !option) ||
                new Set(options).size !== options.length
            ) {
                return {
                    success: false,
                    code: "INVALID_INPUT",
                    message: `Field "${field.label}" needs unique, non-empty select options.`,
                };
            }
        }
    }

    return db.$transaction(async (tx) => {
        const dataset = await tx.dataset.findFirst({
            where: {
                id: datasetId,
                businessId,
            },
            select: {
                id: true,
                fields: {
                    select: {
                        id: true,
                        key: true,
                        type: true,
                    },
                },
                records: {
                    select: {
                        id: true,
                        data: true,
                    },
                },
            },
        });

        if (!dataset) {
            return {
                success: false,
                code: "DATASET_NOT_FOUND",
                message: "Dataset not found.",
            } as const;
        }

        const existingById = new Map(
            dataset.fields.map((field) => [field.id, field]),
        );

        const submittedIds = new Set<string>();

        for (const field of fields) {
            if (!field.id) {
                if (dataset.fields.some((existing) => existing.key === field.key)) {
                    return {
                        success: false,
                        code: "INVALID_INPUT",
                        message: `The key "${field.key}" already exists. Existing fields must retain their IDs.`,
                    } as const;
                }

                continue;
            }

            const existing = existingById.get(field.id);

            if (!existing || submittedIds.has(field.id)) {
                return {
                    success: false,
                    code: "INVALID_INPUT",
                    message:
                        "The submitted schema contains an invalid or duplicate field ID.",
                } as const;
            }

            submittedIds.add(field.id);

            if (field.key !== existing.key) {
                return {
                    success: false,
                    code: "INVALID_INPUT",
                    message:
                        "Existing field keys cannot be changed. Add a new field to use a different key.",
                } as const;
            }

            if (field.type !== existing.type) {
                return {
                    success: false,
                    code: "FIELD_TYPE_CHANGE",
                    message: `The type of "${field.label}" cannot be changed in place. Add a replacement field to migrate the data safely.`,
                } as const;
            }
        }

        const removedFields = dataset.fields.filter(
            (field) => !submittedIds.has(field.id),
        );
        const removedKeys = new Set(removedFields.map((field) => field.key));

        // Required fields cannot be enabled when existing records lack values.
        for (const field of fields) {
            if (!field.isRequired) continue;

            for (const record of dataset.records) {
                if (!isObject(record.data)) {
                    return {
                        success: false,
                        code: "INVALID_EXISTING_DATA",
                        message:
                            "An existing record has an unsupported data structure.",
                    } as const;
                }

                const value = record.data[field.key];

                if (value === undefined || value === null || value === "") {
                    return {
                        success: false,
                        code: "INVALID_EXISTING_DATA",
                        message: `Cannot make "${field.label}" required: at least one existing record has no value for it.`,
                    } as const;
                }
            }
        }

        // Ensure existing select values remain valid under the updated options.
        for (const field of fields) {
            if (
                field.type !== "SINGLE_SELECT" &&
                field.type !== "MULTI_SELECT"
            ) {
                continue;
            }

            const allowedOptions = new Set(
                (field.options ?? []).map((option) => option.trim()),
            );

            for (const record of dataset.records) {
                if (!isObject(record.data)) continue;

                const value = record.data[field.key];

                if (value === undefined || value === null || value === "") continue;

                const values = Array.isArray(value) ? value : [value];

                if (
                    values.some(
                        (item) => typeof item !== "string" || !allowedOptions.has(item),
                    )
                ) {
                    return {
                        success: false,
                        code: "INVALID_EXISTING_DATA",
                        message: `The options for "${field.label}" must include every value currently used by existing records.`,
                    } as const;
                }
            }
        }

        // Remove deleted fields' values from existing records transactionally.
        if (removedKeys.size > 0) {
            for (const record of dataset.records) {
                if (!isObject(record.data)) {
                    return {
                        success: false,
                        code: "INVALID_EXISTING_DATA",
                        message:
                            "An existing record has an unsupported data structure.",
                    } as const;
                }

                const nextData: Record<string, Prisma.JsonValue> = {};

                for (const [key, value] of Object.entries(record.data)) {
                    if (!removedKeys.has(key) && value !== undefined) {
                        nextData[key] = value;
                    }
                }

                await tx.datasetRecord.update({
                    where: { id: record.id },
                    data: {
                        data: nextData as Prisma.InputJsonValue,
                    },
                });
            }
        }

        for (const [position, field] of fields.entries()) {
            const options =
                field.type === "SINGLE_SELECT" ||
                    field.type === "MULTI_SELECT"
                    ? (field.options ?? []).map((option) => option.trim())
                    : Prisma.DbNull;

            const fieldData = {
                label: field.label.trim(),
                type: field.type,
                isRequired: field.isRequired,
                isSearchable: field.isSearchable,
                position,
                options:
                    options === Prisma.DbNull
                        ? Prisma.DbNull
                        : (options as Prisma.InputJsonValue),
            };

            if (field.id) {
                await tx.datasetField.update({
                    where: { id: field.id },
                    data: fieldData,
                });
            } else {
                await tx.datasetField.create({
                    data: {
                        datasetId,
                        key: field.key,
                        ...fieldData,
                    },
                });
            }
        }

        if (removedFields.length > 0) {
            await tx.datasetField.deleteMany({
                where: {
                    datasetId,
                    id: { in: removedFields.map((field) => field.id) },
                },
            });
        }

        return { success: true } as const;
    });
}

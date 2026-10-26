
import { Prisma } from "@/app/generated/prisma/client";
import { z } from "zod";
import { db } from "@/app/lib/db";
import type { OptrTool } from "./types";

const filterSchema = z.object({
    field: z.string().trim().min(1).max(100),
    operator: z.enum(["eq", "contains", "gt", "gte", "lt", "lte"]),
    value: z.union([z.string(), z.number(), z.boolean()]),
});

const searchDataSchema = z.object({
    datasetName: z.string().trim().min(1).max(100),
    query: z.string().trim().max(500).default(""),
    filters: z.array(filterSchema).max(10).default([]),
    limit: z.number().int().min(1).max(20).default(10),
});

type SearchDataInput = z.infer<typeof searchDataSchema>;
type Filter = z.infer<typeof filterSchema>;

function validateFilter(
    filter: Filter,
    field: {
        key: string;
        type: string;
        isSearchable: boolean;
    },
): string | null {
    if (!field.isSearchable) {
        return `Field "${field.key}" is not searchable.`;
    }

    const numericOperators = ["eq", "gt", "gte", "lt", "lte"];
    const textOperators = ["eq", "contains"];
    const dateOperators = ["eq", "gt", "gte", "lt", "lte"];

    switch (field.type) {
        case "NUMBER":
            if (
                typeof filter.value !== "number" ||
                !Number.isFinite(filter.value)
            ) {
                return `Filter "${field.key}" requires a finite numeric value.`;
            }

            if (!numericOperators.includes(filter.operator)) {
                return `Operator "${filter.operator}" is not supported for numeric field "${field.key}".`;
            }
            break;

        case "BOOLEAN":
            if (typeof filter.value !== "boolean") {
                return `Filter "${field.key}" requires a boolean value.`;
            }

            if (filter.operator !== "eq") {
                return `Only the "eq" operator is supported for boolean field "${field.key}".`;
            }
            break;

        case "DATE":
            if (
                typeof filter.value !== "string" ||
                Number.isNaN(Date.parse(filter.value))
            ) {
                return `Filter "${field.key}" requires a valid date string.`;
            }

            if (!dateOperators.includes(filter.operator)) {
                return `Operator "${filter.operator}" is not supported for date field "${field.key}".`;
            }
            break;

        case "TEXT":
        case "SINGLE_SELECT":
        case "URL":
        case "MEDIA":
            if (typeof filter.value !== "string") {
                return `Filter "${field.key}" requires a string value.`;
            }

            if (!textOperators.includes(filter.operator)) {
                return `Operator "${filter.operator}" is not supported for text field "${field.key}".`;
            }
            break;

        case "MULTI_SELECT":
            if (
                filter.operator !== "eq" &&
                filter.operator !== "contains"
            ) {
                return `Only "eq" and "contains" are supported for multi-select field "${field.key}".`;
            }

            if (typeof filter.value !== "string") {
                return `Filter "${field.key}" requires a string value.`;
            }
            break;

        default:
            return `Unsupported field type "${field.type}" for "${field.key}".`;
    }

    return null;
}

function jsonbNumberComparison(
    expression: Prisma.Sql,
    operator: Filter["operator"],
    value: number,
): Prisma.Sql {
    const expected = Prisma.sql`to_jsonb(${value}::double precision)`;

    switch (operator) {
        case "eq":
            return Prisma.sql`${expression} = ${expected}`;
        case "gt":
            return Prisma.sql`${expression} > ${expected}`;
        case "gte":
            return Prisma.sql`${expression} >= ${expected}`;
        case "lt":
            return Prisma.sql`${expression} < ${expected}`;
        case "lte":
            return Prisma.sql`${expression} <= ${expected}`;
        default:
            throw new Error(`Unsupported numeric operator: ${operator}`);
    }
}

function textComparison(
    expression: Prisma.Sql,
    operator: Filter["operator"],
    value: string,
): Prisma.Sql {
    switch (operator) {
        case "eq":
            return Prisma.sql`
                lower(coalesce(${expression}, '')) = lower(${value})
            `;
        case "contains":
            return Prisma.sql`
                position(lower(${value}) in lower(coalesce(${expression}, ''))) > 0
            `;
        default:
            throw new Error(`Unsupported text operator: ${operator}`);
    }
}

function dateComparison(
    expression: Prisma.Sql,
    operator: Filter["operator"],
    value: string,
): Prisma.Sql {
    // Date values must be stored as consistently normalized ISO-8601 strings.
    // Text comparisons avoid unsafe casts of arbitrary JSON strings.
    const expected = new Date(value).toISOString();

    switch (operator) {
        case "eq":
            return Prisma.sql`${expression} = ${expected}`;
        case "gt":
            return Prisma.sql`${expression} > ${expected}`;
        case "gte":
            return Prisma.sql`${expression} >= ${expected}`;
        case "lt":
            return Prisma.sql`${expression} < ${expected}`;
        case "lte":
            return Prisma.sql`${expression} <= ${expected}`;
        default:
            throw new Error(`Unsupported date operator: ${operator}`);
    }
}

export const searchDataTool: OptrTool<typeof searchDataSchema> = {
    name: "search_data",

    description:
        "Search records in a dataset belonging to the current business. " +
        "Use the dataset ID or exact dataset name returned by list_datasets. " +
        "For customer requirements, use structured filters whenever possible. " +
        "Each filter has a field, operator, and typed value. " +
        "Use eq for exact matches, contains for text matching, and gt/gte/lt/lte " +
        "for numeric or date comparisons. Boolean fields support eq only. " +
        "All filters are combined with AND. Use query for optional keyword " +
        "search in addition to filters; leave query empty when using only " +
        "structured filters. Only searchable fields can be filtered. " +
        "This tool is read-only.",

    parameters: searchDataSchema,

    async execute(input: SearchDataInput, context) {
        const dataset = await db.dataset.findFirst({
            where: {
                businessId: context.businessId,
                OR: [
                    { id: input.datasetName },
                    {
                        name: {
                            equals: input.datasetName,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            include: {
                fields: {
                    orderBy: {
                        position: "asc",
                    },
                },
            },
        });

        if (!dataset) {
            const availableDatasets = await db.dataset.findMany({
                where: {
                    businessId: context.businessId,
                },
                select: {
                    name: true,
                },
                orderBy: {
                    name: "asc",
                },
            });

            return {
                success: false,
                error: `Dataset "${input.datasetName}" was not found. Available datasets: ${availableDatasets.map((item) => item.name).join(", ") ||
                    "none"
                    }.`,
            };
        }

        const searchableFields = dataset.fields.filter(
            (field) => field.isSearchable,
        );

        const fieldsByKey = new Map(
            dataset.fields.map((field) => [field.key, field]),
        );

        // Validate all filters before building the SQL query.
        for (const filter of input.filters) {
            const field = fieldsByKey.get(filter.field);

            if (!field) {
                return {
                    success: false,
                    error: `Unknown field "${filter.field}" in dataset "${dataset.name}".`,
                };
            }

            const validationError = validateFilter(filter, field);

            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }
        }

        const terms = input.query
            .toLowerCase()
            .split(/[^a-z0-9.]+/i)
            .filter((term) => term.length >= 2)
            .slice(0, 15);

        // Every condition is parameterized through Prisma.sql.
        const conditions: Prisma.Sql[] = [
            Prisma.sql`"datasetId" = ${dataset.id}`,
        ];

        for (const filter of input.filters) {
            const field = fieldsByKey.get(filter.field);

            if (!field) {
                return {
                    success: false,
                    error: `Unknown field "${filter.field}".`,
                };
            }

            const jsonValue = Prisma.sql`"data" -> ${filter.field}`;
            const textValue = Prisma.sql`"data" ->> ${filter.field}`;

            switch (field.type) {
                case "NUMBER": {
                    if (typeof filter.value !== "number") {
                        return {
                            success: false,
                            error: `Filter "${field.key}" requires a numeric value.`,
                        };
                    }

                    conditions.push(
                        Prisma.sql`
                            jsonb_typeof(${jsonValue}) = 'number'
                            AND ${jsonbNumberComparison(
                            jsonValue,
                            filter.operator,
                            filter.value,
                        )}
                        `,
                    );
                    break;
                }

                case "BOOLEAN": {
                    conditions.push(
                        Prisma.sql`
                            jsonb_typeof(${jsonValue}) = 'boolean'
                            AND ${textValue} = ${String(filter.value)}
                        `,
                    );
                    break;
                }

                case "DATE": {
                    if (typeof filter.value !== "string") {
                        return {
                            success: false,
                            error: `Filter "${field.key}" requires a date string.`,
                        };
                    }

                    conditions.push(
                        Prisma.sql`
                            jsonb_typeof(${jsonValue}) = 'string'
                            AND ${dateComparison(
                            textValue,
                            filter.operator,
                            filter.value,
                        )}
                        `,
                    );
                    break;
                }

                case "MULTI_SELECT": {
                    if (typeof filter.value !== "string") {
                        return {
                            success: false,
                            error: `Filter "${field.key}" requires a string value.`,
                        };
                    }

                    conditions.push(
                        Prisma.sql`
                            CASE
                                WHEN jsonb_typeof(${jsonValue}) = 'array'
                                THEN ${jsonValue} @> jsonb_build_array(${filter.value})
                                WHEN jsonb_typeof(${jsonValue}) = 'string'
                                THEN lower(${textValue}) = lower(${filter.value})
                                ELSE FALSE
                            END
                        `,
                    );
                    break;
                }

                case "TEXT":
                case "SINGLE_SELECT":
                case "URL":
                case "MEDIA": {
                    if (typeof filter.value !== "string") {
                        return {
                            success: false,
                            error: `Filter "${field.key}" requires a string value.`,
                        };
                    }

                    conditions.push(
                        textComparison(
                            textValue,
                            filter.operator,
                            filter.value,
                        ),
                    );
                    break;
                }

                default:
                    return {
                        success: false,
                        error: `Unsupported field type "${field.type}".`,
                    };
            }
        }

        // Keyword terms are ORed across searchable fields.
        // The resulting keyword condition is ANDed with all structured filters.
        if (terms.length > 0) {
            const keywordConditions = terms.flatMap((term) =>
                searchableFields.map(
                    (field) => Prisma.sql`
                        position(
                            lower(${term})
                            in lower(coalesce("data" ->> ${field.key}, ''))
                        ) > 0
                    `,
                ),
            );

            conditions.push(
                keywordConditions.length > 0
                    ? Prisma.sql`(${Prisma.join(keywordConditions, " OR ")})`
                    : Prisma.sql`FALSE`,
            );
        }

        // PostgreSQL performs filtering, sorting, and limiting.
        const records = await db.$queryRaw<
            Array<{
                id: string;
                data: unknown;
                createdAt: Date;
                updatedAt: Date;
            }>
        >(
            Prisma.sql`
                SELECT
                    "id",
                    "data",
                    "createdAt",
                    "updatedAt"
                FROM "DatasetRecord"
                WHERE ${Prisma.join(conditions, " AND ")}
                ORDER BY "updatedAt" DESC
                LIMIT ${input.limit}
            `,
        );

        return {
            success: true,
            data: {
                dataset: {
                    id: dataset.id,
                    name: dataset.name,
                    fields: dataset.fields.map((field) => ({
                        key: field.key,
                        label: field.label,
                        type: field.type,
                    })),
                },
                count: records.length,
                records,
                searchMode:
                    input.filters.length > 0
                        ? terms.length > 0
                            ? "structured_and_keyword"
                            : "structured"
                        : terms.length > 0
                            ? "keyword"
                            : "all",
                filtersApplied: input.filters,
                note:
                    "Structured filters and keyword matching are executed in PostgreSQL. " +
                    "Date fields must use consistently normalized ISO-8601 strings.",
            },
        };
    },
};

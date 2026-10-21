
import { z } from "zod";
import { db } from "@/app/lib/db";
import type { OptrTool } from "./types";

const listDatasetsSchema = z.object({});

export const listDatasetsTool: OptrTool<typeof listDatasetsSchema> = {
    name: "list_datasets",
    description:
        "List the datasets available to the current business, including their names, descriptions, and field definitions. Use this before search_data when you do not know which dataset contains the requested information. This tool is read-only and only accesses the current business's data.",
    parameters: listDatasetsSchema,

    async execute(_input, context) {
        const datasets = await db.dataset.findMany({
            where: {
                businessId: context.businessId,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                description: true,
                fields: {
                    orderBy: {
                        position: "asc",
                    },
                    select: {
                        key: true,
                        label: true,
                        type: true,
                        isSearchable: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: {
                count: datasets.length,
                datasets,
            },
        };
    },
};

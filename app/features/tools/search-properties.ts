import { z } from "zod";
import { db } from "@/app/lib/db";
import type { OptrTool } from "./types";

const searchPropertiesSchema = z.object({
    city: z.string().optional(),
    area: z.string().optional(),
    bedrooms: z.number().int().positive().optional(),
    maxPrice: z.number().positive().optional(),
});

type SearchPropertiesInput = z.infer<
    typeof searchPropertiesSchema
>;

export const searchPropertiesTool: OptrTool<
    typeof searchPropertiesSchema
> = {
    name: "search_properties",

    description:
        "Search available real estate properties by city, area, bedrooms, and maximum price.",

    parameters: searchPropertiesSchema,

    async execute(
        input: SearchPropertiesInput,
        context,
    ) {
        const properties = await db.property.findMany({
            where: {
                businessId: context.businessId,
                available: true,

                ...(input.city
                    ? {
                        city: {
                            contains: input.city,
                            mode: "insensitive",
                        },
                    }
                    : {}),

                ...(input.area
                    ? {
                        area: {
                            contains: input.area,
                            mode: "insensitive",
                        },
                    }
                    : {}),

                ...(input.bedrooms
                    ? {
                        bedrooms: input.bedrooms,
                    }
                    : {}),

                ...(input.maxPrice
                    ? {
                        price: {
                            lte: input.maxPrice,
                        },
                    }
                    : {}),
            },

            orderBy: {
                price: "asc",
            },

            take: 10,
        });

        return {
            success: true,
            data: properties.map((property) => ({
                id: property.id,
                title: property.title,
                city: property.city,
                area: property.area,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                price: property.price,
                currency: property.currency,
                description: property.description,
                imageUrl: property.imageUrl,
            })),
        };
    },
};
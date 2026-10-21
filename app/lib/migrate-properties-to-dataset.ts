
import { db } from "./db";

const BUSINESS_ID = "demo-business";
const DATASET_NAME = "properties";

async function main() {
    try {
        const properties = await db.property.findMany({
            where: {
                businessId: BUSINESS_ID,
            },
            select: {
                id: true,
                title: true,
                city: true,
                area: true,
                bedrooms: true,
                bathrooms: true,
                price: true,
                currency: true,
                description: true,
                available: true,
            },
        });

        const dataset = await db.dataset.upsert({
            where: {
                businessId_name: {
                    businessId: BUSINESS_ID,
                    name: DATASET_NAME,
                },
            },
            update: {},
            create: {
                businessId: BUSINESS_ID,
                name: DATASET_NAME,
                description: "Property inventory for the demo business.",
                fields: {
                    create: [
                        { key: "title", label: "Title", type: "TEXT", isSearchable: true, isRequired: true },
                        { key: "city", label: "City", type: "TEXT", isSearchable: true },
                        { key: "area", label: "Area", type: "TEXT", isSearchable: true },
                        { key: "bedrooms", label: "Bedrooms", type: "NUMBER", isSearchable: true },
                        { key: "bathrooms", label: "Bathrooms", type: "NUMBER", isSearchable: true },
                        { key: "price", label: "Price", type: "NUMBER", isSearchable: true },
                        { key: "currency", label: "Currency", type: "TEXT", isSearchable: true },
                        { key: "description", label: "Description", type: "TEXT", isSearchable: true },
                        { key: "available", label: "Available", type: "BOOLEAN", isSearchable: true },
                    ],
                },
            },
        });

        let created = 0;
        let skipped = 0;

        for (const property of properties) {
            const existing = await db.datasetRecord.findFirst({
                where: {
                    datasetId: dataset.id,
                    data: {
                        path: ["legacyPropertyId"],
                        equals: property.id,
                    },
                },
                select: { id: true },
            });

            if (existing) {
                skipped++;
                continue;
            }

            const { id, ...data } = property;

            await db.datasetRecord.create({
                data: {
                    datasetId: dataset.id,
                    data: {
                        ...data,
                        legacyPropertyId: id,
                    },
                },
            });

            created++;
        }

        console.log(`Dataset: ${dataset.name}`);
        console.log(`Existing legacy properties: ${properties.length}`);
        console.log(`Records created: ${created}`);
        console.log(`Records skipped (already migrated): ${skipped}`);
    } finally {
        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

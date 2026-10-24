
import { db } from "./db";

const DEMO_BUSINESS_ID = "demo-business";

const contactFields = [
    {
        key: "budget",
        label: "Budget",
        description:
            "The customer's explicitly stated budget for purchasing or renting a property.",
        type: "NUMBER" as const,
        position: 0,
    },
    {
        key: "preferred_location",
        label: "Preferred Location",
        description:
            "The area, city, or neighborhood where the customer wants a property.",
        type: "TEXT" as const,
        position: 1,
    },
    {
        key: "property_type",
        label: "Property Type",
        description:
            "The type of property and configuration the customer wants, such as a 3 BHK flat or villa.",
        type: "TEXT" as const,
        position: 2,
    },
];

async function main() {
    for (const field of contactFields) {
        await db.contactField.upsert({
            where: {
                businessId_key: {
                    businessId: DEMO_BUSINESS_ID,
                    key: field.key,
                },
            },
            update: {
                label: field.label,
                description: field.description,
                type: field.type,
                position: field.position,
                isActive: true,
            },
            create: {
                businessId: DEMO_BUSINESS_ID,
                ...field,
            },
        });
    }

    console.log(
        `Seeded ${contactFields.length} contact fields for ${DEMO_BUSINESS_ID}`,
    );
}

main()
    .catch((error) => {
        console.error("Failed to seed contact fields:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });

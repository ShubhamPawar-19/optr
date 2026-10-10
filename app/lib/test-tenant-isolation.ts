
import { db } from "./db";
import { searchPropertiesTool } from "../features/tools/search-properties";

const BUSINESS_A = "demo-business";
const BUSINESS_B = "tenant-isolation-test-business";
const TEST_PROPERTY_ID = "tenant-isolation-test-property";

async function main() {
    await db.business.upsert({
        where: { id: BUSINESS_B },
        update: {},
        create: {
            id: BUSINESS_B,
            name: "Tenant Isolation Test Business",
        },
    });

    await db.property.upsert({
        where: { id: TEST_PROPERTY_ID },
        update: {
            businessId: BUSINESS_B,
            title: "PRIVATE TEST PROPERTY - BUSINESS B",
            available: true,
        },
        create: {
            id: TEST_PROPERTY_ID,
            businessId: BUSINESS_B,
            title: "PRIVATE TEST PROPERTY - BUSINESS B",
            city: "Dubai",
            area: "Tenant Isolation Test",
            bedrooms: 2,
            bathrooms: 2,
            price: 500000,
            currency: "AED",
            description: "Temporary property used to test tenant isolation.",
            available: true,
        },
    });

    try {
        const resultA = await searchPropertiesTool.execute(
            {},
            {
                agentId: "test-agent-a",
                businessId: BUSINESS_A,
                userId: "test-user",
                runId: "tenant-test-a",
            },
        );

        const resultB = await searchPropertiesTool.execute(
            {},
            {
                agentId: "test-agent-b",
                businessId: BUSINESS_B,
                userId: "test-user",
                runId: "tenant-test-b",
            },
        );

        if (!resultA.success || !resultB.success) {
            throw new Error("A property search failed.");
        }

        const propertiesA = resultA.data as Array<{ id: string; title: string }>;
        const propertiesB = resultB.data as Array<{ id: string; title: string }>;

        const leakedIntoA = propertiesA.some(
            (property) => property.id === TEST_PROPERTY_ID,
        );

        const visibleToB = propertiesB.some(
            (property) => property.id === TEST_PROPERTY_ID,
        );

        console.log("Business A property count:", propertiesA.length);
        console.log("Business B property count:", propertiesB.length);
        console.log("Test property visible to Business A:", leakedIntoA);
        console.log("Test property visible to Business B:", visibleToB);

        if (leakedIntoA || !visibleToB) {
            throw new Error("TENANT ISOLATION TEST FAILED");
        }

        console.log("PASS: Business A cannot access Business B's property.");
    } finally {
        await db.property.deleteMany({
            where: { id: TEST_PROPERTY_ID },
        });
        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
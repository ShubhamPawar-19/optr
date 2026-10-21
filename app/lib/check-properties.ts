
import { db } from "./db";

async function main() {
    try {
        const properties = await db.property.findMany({
            where: {
                businessId: "demo-business",
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
            take: 5,
        });

        console.log("Existing demo properties:", properties.length);
        console.dir(properties, { depth: null });
    } finally {
        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

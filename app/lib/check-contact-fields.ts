
import { db } from "./db";

async function main() {
    const fields = await db.contactField.findMany({
        where: { businessId: "demo-business" },
        orderBy: { position: "asc" },
        select: {
            key: true,
            label: true,
            type: true,
            isActive: true,
        },
    });

    console.table(fields);
}

main()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect();
    });

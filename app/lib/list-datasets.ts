
import { db } from "./db";

async function main() {
    try {
        const datasets = await db.dataset.findMany({
            select: {
                name: true,
                businessId: true,
                _count: {
                    select: {
                        records: true,
                    },
                },
            },
            orderBy: [
                { businessId: "asc" },
                { name: "asc" },
            ],
        });

        console.dir(datasets, { depth: null });
    } finally {
        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


import { db } from "./db";
import { searchDataTool } from "../features/tools/search-data";

const BUSINESS_A = "demo-business";
const BUSINESS_B = "tenant-isolation-test-business";
const DATASET_NAME = "Tenant Isolation Test Dataset";
const TEST_RECORD_MARKER = "PRIVATE-BUSINESS-B-RECORD";

async function main() {
    let datasetId: string | undefined;

    try {
        await db.business.upsert({
            where: { id: BUSINESS_B },
            update: {},
            create: {
                id: BUSINESS_B,
                name: "Tenant Isolation Test Business",
            },
        });

        const dataset = await db.dataset.upsert({
            where: {
                businessId_name: {
                    businessId: BUSINESS_B,
                    name: DATASET_NAME,
                },
            },
            update: {},
            create: {
                businessId: BUSINESS_B,
                name: DATASET_NAME,
                fields: {
                    create: [
                        {
                            key: "marker",
                            label: "Marker",
                            type: "TEXT",
                            isSearchable: true,
                        },
                    ],
                },
            },
        });

        datasetId = dataset.id;

        await db.datasetRecord.create({
            data: {
                datasetId,
                data: {
                    marker: TEST_RECORD_MARKER,
                    description: "Private test record",
                },
            },
        });

        const contextA = {
            agentId: "test-agent-a",
            businessId: BUSINESS_A,
            userId: "test-user",
            runId: "tenant-test-a",
        };

        const contextB = {
            agentId: "test-agent-b",
            businessId: BUSINESS_B,
            userId: "test-user",
            runId: "tenant-test-b",
        };

        const resultA = await searchDataTool.execute(
            {
                datasetName: DATASET_NAME,
                query: TEST_RECORD_MARKER,
                filters: [],
                limit: 10,
            },
            contextA,
        );

        const resultB = await searchDataTool.execute(
            {
                datasetName: DATASET_NAME,
                query: TEST_RECORD_MARKER,
                filters: [],
                limit: 10,
            },
            contextB,
        );

        // Business A must not be able to find Business B's dataset.
        if (resultA.success) {
            throw new Error(
                "FAIL: Business A accessed Business B's dataset.",
            );
        }

        console.log(
            "PASS: Business A cannot access Business B's dataset.",
        );

        // Business B must be able to find and read its own dataset.
        if (!resultB.success || !resultB.data) {
            console.error("Business B result:");
            console.dir(resultB, { depth: null });

            throw new Error(
                "FAIL: Business B could not access its own dataset.",
            );
        }

        const dataB = resultB.data as {
            records: Array<{ data: Record<string, unknown> }>;
        };

        const visibleToB = dataB.records.some(
            (record) => record.data.marker === TEST_RECORD_MARKER,
        );

        if (!visibleToB) {
            throw new Error(
                "FAIL: Business B could not retrieve its own record.",
            );
        }

        console.log(
            "PASS: Business B can access its own dataset record.",
        );
    } finally {
        if (datasetId) {
            await db.datasetRecord.deleteMany({
                where: { datasetId },
            });

            await db.dataset.deleteMany({
                where: { id: datasetId },
            });
        }

        await db.business.deleteMany({
            where: {
                id: BUSINESS_B,
                datasets: { none: {} },
                agents: { none: {} },
            },
        });

        await db.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

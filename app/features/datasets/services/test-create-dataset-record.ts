
import { db } from "@/app/lib/db";
import { createDatasetRecord } from "./create-dataset-record";

const BUSINESS_A = "demo-business";
const BUSINESS_B = "create-record-test-business";
const DATASET_NAME = "Create Record Test Dataset";

async function main() {
  let datasetId: string | undefined;

  try {
    await db.business.upsert({
      where: { id: BUSINESS_B },
      update: {},
      create: {
        id: BUSINESS_B,
        name: "Create Record Test Business",
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
              key: "title",
              label: "Title",
              type: "TEXT",
              isRequired: true,
            },
            {
              key: "price",
              label: "Price",
              type: "NUMBER",
              isRequired: true,
            },
            {
              key: "status",
              label: "Status",
              type: "SINGLE_SELECT",
              isRequired: true,
              options: ["available", "sold"],
            },
          ],
        },
      },
    });

    datasetId = dataset.id;

    // 1. Valid records should be created.
    const valid = await createDatasetRecord({
      businessId: BUSINESS_B,
      datasetId,
      data: {
        title: "Test Property",
        price: 1_400_000,
        status: "available",
      },
    });

    if (!valid.success) {
      throw new Error(
        `FAIL: Valid record rejected: ${JSON.stringify(valid)}`,
      );
    }

    console.log("PASS: Valid record created.");

    // 2. Invalid records should be rejected.
    const beforeInvalid = await db.datasetRecord.count({
      where: { datasetId },
    });

    const invalid = await createDatasetRecord({
      businessId: BUSINESS_B,
      datasetId,
      data: {
        title: "Invalid Property",
        price: "not-a-number",
        status: "available",
      },
    });

    const afterInvalid = await db.datasetRecord.count({
      where: { datasetId },
    });

    if (
      invalid.success ||
      invalid.code !== "VALIDATION_FAILED" ||
      beforeInvalid !== afterInvalid
    ) {
      throw new Error(
        "FAIL: Invalid record was accepted or persisted.",
      );
    }

    console.log("PASS: Invalid record rejected without insertion.");

    // 3. Another business must not access this dataset.
    const unauthorized = await createDatasetRecord({
      businessId: BUSINESS_A,
      datasetId,
      data: {
        title: "Unauthorized Property",
        price: 100,
        status: "available",
      },
    });

    if (
      unauthorized.success ||
      unauthorized.code !== "DATASET_NOT_FOUND"
    ) {
      throw new Error(
        "FAIL: Cross-business record creation was not blocked.",
      );
    }

    console.log("PASS: Cross-business record creation blocked.");
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

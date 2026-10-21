import assert from "node:assert/strict";
import test from "node:test";

import { validateDatasetRecord } from "./validate-record";
import type { DatasetFieldDefinition } from "./validate-record";

const fields: DatasetFieldDefinition[] = [
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
    key: "available",
    label: "Available",
    type: "BOOLEAN",
    isRequired: false,
  },
  {
    key: "status",
    label: "Status",
    type: "SINGLE_SELECT",
    isRequired: true,
    options: ["available", "sold"],
  },
  {
    key: "features",
    label: "Features",
    type: "MULTI_SELECT",
    isRequired: false,
    options: ["pool", "parking", "gym"],
  },
];

test("accepts a valid record", () => {
  const result = validateDatasetRecord(fields, {
    title: "Marina View",
    price: 1_400_000,
    available: true,
    status: "available",
    features: ["pool", "parking"],
  });

  assert.equal(result.success, true);
});

test("rejects missing required fields", () => {
  const result = validateDatasetRecord(fields, {
    title: "Marina View",
    status: "available",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.errors.some((error) => error.field === "price"));
  }
});

test("rejects invalid field types", () => {
  const result = validateDatasetRecord(fields, {
    title: "Marina View",
    price: "1,400,000",
    status: "available",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.errors.some((error) => error.field === "price"));
  }
});

test("rejects unknown fields", () => {
  const result = validateDatasetRecord(fields, {
    title: "Marina View",
    price: 1_400_000,
    status: "available",
    cityy: "Dubai",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.errors.some((error) => error.field === "cityy"));
  }
});

test("rejects unconfigured select options", () => {
  const result = validateDatasetRecord(fields, {
    title: "Marina View",
    price: 1_400_000,
    status: "pending",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.errors.some((error) => error.field === "status"));
  }
});

test("accepts optional fields when omitted", () => {
  const result = validateDatasetRecord(fields, {
    title: "Marina View",
    price: 1_400_000,
    status: "available",
  });

  assert.equal(result.success, true);
});

test("rejects non-object record input", () => {
  const result = validateDatasetRecord(fields, ["not", "an", "object"]);

  assert.equal(result.success, false);
});
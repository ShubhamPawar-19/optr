import type { getDataset } from "./queries/get-dataset";

export type DatasetDetail = NonNullable<
  Awaited<ReturnType<typeof getDataset>>
>;

export type DatasetFieldSummary = DatasetDetail["fields"][number];

export type DatasetRecordSummary = DatasetDetail["records"][number];
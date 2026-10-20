import { notFound } from "next/navigation";

import { DatasetDetailPage } from "@/app/features/datasets/components/dataset-detail-page";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";

interface PageProps {
  params: Promise<{
    datasetId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps) {
  const { datasetId } = await params;
  const dataset = await getDataset(datasetId);

  if (!dataset) {
    notFound();
  }

  return <DatasetDetailPage dataset={dataset} />;
}
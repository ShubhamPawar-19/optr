import { notFound } from "next/navigation";

import { requireCurrentBusiness } from "@/app/lib/current-business";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";
import { CreateRecordForm } from "@/app/features/datasets/components/create-record-form";

interface PageProps {
  params: Promise<{ datasetId: string }>;
}

export const dynamic = "force-dynamic";

export default async function NewRecordPage({ params }: PageProps) {
  await requireCurrentBusiness();

  const { datasetId } = await params;
  const dataset = await getDataset(datasetId);

  if (!dataset) {
    notFound();
  }

  return (
    <CreateRecordForm
      datasetId={dataset.id}
      fields={dataset.fields}
    />
  );
}
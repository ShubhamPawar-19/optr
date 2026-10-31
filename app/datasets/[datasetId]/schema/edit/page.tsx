
import { notFound } from "next/navigation";
import { requireCurrentBusiness } from "@/app/lib/current-business";
import { EditDatasetSchemaPage } from "@/app/features/datasets/components/edit-dataset-schema-page";
import type { EditableDatasetField } from "@/app/features/datasets/components/edit-dataset-schema-page";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";

interface PageProps {
  params: Promise<{
    datasetId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps) {
  await requireCurrentBusiness();

  const { datasetId } = await params;
  const dataset = await getDataset(datasetId);

  if (!dataset) {
    notFound();
  }

  const initialFields: EditableDatasetField[] = dataset.fields.map(
    (field) => ({
      id: field.id,
      label: field.label,
      key: field.key,
      type: field.type,
      isRequired: field.isRequired,
      isSearchable: field.isSearchable,
      options:
        Array.isArray(field.options) &&
        field.options.every((option) => typeof option === "string")
          ? field.options
          : [],
    })
  );

  return (
    <EditDatasetSchemaPage
      datasetId={dataset.id}
      datasetName={dataset.name}
      initialFields={initialFields}
    />
  );
}

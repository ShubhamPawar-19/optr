
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";
import { getDatasetRecord } from "@/app/features/datasets/queries/get-dataset-record";
import { EditRecordForm } from "@/app/features/datasets/components/edit-record-form";

interface PageProps {
  params: Promise<{
    datasetId: string;
    recordId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditRecordPage({ params }: PageProps) {
  const { datasetId, recordId } = await params;

  const [dataset, record] = await Promise.all([
    getDataset(datasetId),
    getDatasetRecord(datasetId, recordId),
  ]);

  if (!dataset || !record) {
    notFound();
  }

  const initialData =
    record.data !== null &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
      ? (record.data as Record<string, unknown>)
      : {};

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/datasets/${dataset.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to {dataset.name}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Edit record
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update this record in {dataset.name}.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <EditRecordForm
            datasetId={dataset.id}
            recordId={record.id}
            fields={dataset.fields}
            initialData={initialData}
          />
        </div>
      </div>
    </main>
  );
}

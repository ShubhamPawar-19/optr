
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/datasets/${dataset.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to {dataset.name}
          </Link>

          <Link
            href={`/datasets/${dataset.id}/schema/edit`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
          >
            <SlidersHorizontal size={16} />
            Edit schema
          </Link>
        </div>

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

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, Plus } from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";
import { DatasetRecordsTable } from "@/app/features/datasets/components/dataset-records-table";

interface PageProps {
  params: Promise<{
    datasetId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function DatasetRecordsPage({ params }: PageProps) {
  const { datasetId } = await params;
  const dataset = await getDataset(datasetId);

  if (!dataset) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-slate-50 text-[#292923]-950">
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="mb-8 flex min-w-0 items-center gap-3 border-b border-slate-400 pb-5">
          <SidebarToggle />

          <div className="min-w-0 flex-1">
            <Link
              href={`/datasets/${dataset.id}`}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-[#292923]-500 transition hover:text-[#292923]-950"
            >
              <ArrowLeft size={15} />
              Back to dataset overview
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Database size={18} className="shrink-0 text-[#292923]-500" />
              <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight sm:text-2xl">
                {dataset.name} records
              </h1>
            </div>

            <p className="mt-2 text-sm text-[#292923]-500">
              Browse and manage the records stored in this dataset.
            </p>
          </div>

          <Link
            href={`/datasets/${dataset.id}/records/new`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#292923] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#292923]-800 sm:px-4"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add record</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-400 bg-white p-5">
            <p className="text-sm text-[#292923]-500">Total records</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {dataset._count.records.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-400 bg-white p-5">
            <p className="text-sm text-[#292923]-500">Schema fields</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {dataset.fields.length.toLocaleString()}
            </p>
          </div>
        </section>

        <DatasetRecordsTable
          datasetId={dataset.id}
          fields={dataset.fields}
          records={dataset.records}
          totalRecords={dataset._count.records}
        />
      </div>
    </main>
  );
}

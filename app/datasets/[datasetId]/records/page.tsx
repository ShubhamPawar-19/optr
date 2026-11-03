
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  FileText,
  Plus,
} from "lucide-react";

import { requireCurrentBusiness } from "@/app/lib/current-business";
import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";
import { DatasetRecordsTable } from "@/app/features/datasets/components/dataset-records-table";

interface PageProps {
  params: Promise<{
    datasetId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function DatasetRecordsPage({
  params,
}: PageProps) {
  await requireCurrentBusiness();

  const { datasetId } = await params;
  const dataset = await getDataset(datasetId);

  if (!dataset) {
    notFound();
  }

  const totalRecords = dataset._count.records;
  const totalFields = dataset.fields.length;
  const loadedRecords = dataset.records.length;

  return (
    <main className="min-h-screen w-full min-w-0 bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Workspace header */}
        <header className="mb-8 flex min-w-0 items-center gap-3 border-b border-slate-200 pb-5">
          <SidebarToggle />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                href="/"
                className="transition hover:text-[#292923]"
              >
                Workspace
              </Link>

              <span>/</span>

              <Link
                href="/datasets"
                className="transition hover:text-[#292923]"
              >
                Datasets
              </Link>

              <span>/</span>

              <Link
                href={`/datasets/${dataset.id}`}
                className="transition hover:text-[#292923]"
              >
                Dataset details
              </Link>

              <span>/</span>

              <span className="truncate text-[#292923]">
                Records
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Database
                size={17}
                className="shrink-0 text-slate-500"
              />

              <p className="truncate text-sm font-semibold text-[#292923]">
                {dataset.name}
              </p>
            </div>
          </div>

          <Link
            href={`/datasets/${dataset.id}/records/new`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#292923] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-4"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add record</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </header>

        {/* Page introduction */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Dataset management
            </span>

            <span className="text-xs text-slate-400">
              Record management
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-semibold tracking-tight text-[#292923] sm:text-3xl">
                {dataset.name} records
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse, review, and manage the records stored in this dataset.
              </p>
            </div>

            <Link
              href={`/datasets/${dataset.id}`}
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#292923]"
            >
              <ArrowLeft size={15} />
              Back to dataset
            </Link>
          </div>
        </section>

        {/* Overview cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total records"
            value={totalRecords.toLocaleString()}
            description="Records saved in this dataset"
            icon={<Database size={18} />}
            accent="indigo"
          />

          <SummaryCard
            title="Schema fields"
            value={totalFields.toLocaleString()}
            description="Fields available for each record"
            icon={<FileText size={18} />}
            accent="amber"
          />

          <SummaryCard
            title="Loaded records"
            value={loadedRecords.toLocaleString()}
            description="Records currently displayed"
            icon={<LayersIcon />}
            accent="teal"
          />
        </section>

        {/* Records table */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-[#292923]">
                All records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage the records in your dataset.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              {totalRecords.toLocaleString()} records
            </span>
          </div>

          <DatasetRecordsTable
            datasetId={dataset.id}
            fields={dataset.fields}
            records={dataset.records}
            totalRecords={totalRecords}
          />
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-400">
            OPTR · Dataset management
          </p>
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent: "indigo" | "amber" | "teal";
}) {
  const accentStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#292923] tabular-nums">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function LayersIcon() {
  return <Database size={18} />;
}

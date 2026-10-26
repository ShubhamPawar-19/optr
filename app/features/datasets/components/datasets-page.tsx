import Link from "next/link";
import {
  ArrowUpRight,
  Database,
  FileText,
  Layers3,
  Plus,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import type { DatasetSummary } from "../types";

interface DatasetsPageProps {
  datasets: DatasetSummary[];
}

export function DatasetsPage({ datasets }: DatasetsPageProps) {
  const totalRecords = datasets.reduce(
    (total, dataset) => total + dataset._count.records,
    0,
  );

  const totalFields = datasets.reduce(
    (total, dataset) => total + dataset._count.fields,
    0,
  );

  return (
    <main className="min-h-screen w-full min-w-0 flex-1 bg-slate-50 text-slate-950">
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <SidebarToggle />

              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-sm text-slate-500"
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-slate-950"
                >
                  Workspace
                </Link>
                <span className="text-slate-300">/</span>
                <span className="font-medium text-slate-900">
                  Datasets
                </span>
              </nav>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Datasets
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage the structured information your AI agents use to
              answer questions and complete tasks.
            </p>
          </div>

          <Link
            href="/datasets/new"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            <Plus size={16} />
            New dataset
          </Link>
        </header>

        <section
          aria-label="Dataset statistics"
          className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3"
        >
          <SummaryCard
            icon={<Database size={18} />}
            label="Total datasets"
            value={datasets.length}
          />

          <SummaryCard
            icon={<FileText size={18} />}
            label="Total records"
            value={totalRecords}
          />

          <SummaryCard
            icon={<Layers3 size={18} />}
            label="Total fields"
            value={totalFields}
          />
        </section>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Your data
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Structured collections available to your agents.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              {datasets.length}{" "}
              {datasets.length === 1 ? "dataset" : "datasets"}
            </span>
          </div>

          {datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Database size={22} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No datasets yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Create a dataset to organize the business information
                your AI agents can search and use when responding to
                inquiries.
              </p>

              <Link
                href="/datasets/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <Plus size={16} />
                Create your first dataset
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {datasets.map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.id}`}
                  className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-950/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:bg-slate-100">
                      <Database size={20} />
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-900">
                      View details
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>

                  <h3 className="mt-5 truncate text-base font-semibold text-slate-900">
                    {dataset.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                    {dataset.description || "No description provided."}
                  </p>

                  <div className="mt-5 flex items-center gap-8 border-t border-slate-100 pt-4">
                    <Count
                      label="Records"
                      value={dataset._count.records}
                    />

                    <Count
                      label="Fields"
                      value={dataset._count.fields}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-200/80 pt-4">
          <p className="text-xs text-slate-400">
            Demo workspace · Read-only preview
          </p>
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>

        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function Count({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-lg font-semibold tracking-tight text-slate-900">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
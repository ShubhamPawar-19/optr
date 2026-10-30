
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Database,
  FilePlus2,
  FileText,
  Layers3,
  Plus,
  Target,
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

  const quickActions = [
    {
      title: "Create dataset",
      description: "Create a collection and define its fields.",
      href: "/datasets/new",
      icon: <Plus size={19} />,
      iconClass: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      action: "Get started",
    },
    {
      title: "Create record",
      description: "Choose a dataset and add a new record.",
      href: "#dataset-list",
      icon: <FilePlus2 size={19} />,
      iconClass: "bg-teal-50 text-teal-700 ring-teal-100",
      action: "Choose dataset",
    },
    {
      title: "View datasets",
      description: "Browse collections and manage their records.",
      href: "#dataset-list",
      icon: <Database size={19} />,
      iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
      action: "Browse datasets",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Sticky workspace header */}
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#292923]/50">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-2 text-xs text-[#292923]/50"
                >
                  <Link
                    href="/datasets"
                    className="font-bold text-[#292923]"
                  >
                    Datasets
                  </Link>
                  <Link
                    href="/datasets/new"
                    className="transition hover:text-[#292923]"
                  >
                    <span className=" text-[#292923]/75">
                      Create
                    </span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          <Link
            href="/datasets/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#292923] px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]/85"
          >
            <Plus size={15} />
            <span>New dataset</span>
            <ArrowUpRight size={14} />
          </Link>
        </header>

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 pb-5 pt-7 sm:flex-row sm:items-end sm:pb-6 sm:pt-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Business data
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
              Give your agents the right information.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
              Manage structured business information your AI agents
              use to answer questions and complete tasks.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]/60">
            <CalendarClock size={15} className="text-emerald-600" />
            <span>Live workspace data</span>
          </div>
        </section>

        {/* Summary metrics */}
        <section
          aria-label="Dataset overview"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryMetric
            label="Total datasets"
            value={datasets.length}
            description="Collections in this workspace"
            icon={Database}
            accent="indigo"
          />

          <SummaryMetric
            label="Total records"
            value={totalRecords}
            description="Records across all datasets"
            icon={FileText}
            accent="teal"
          />

          <SummaryMetric
            label="Total fields"
            value={totalFields}
            description="Configured dataset attributes"
            icon={Layers3}
            accent="amber"
          />
        </section>

        {/* Dataset workspace */}
        <section
          id="dataset-list"
          className="mt-6 scroll-mt-24 overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm sm:mt-7"
        >
          {/* Section title */}
          <div className="flex flex-col gap-4 border-b border-slate-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Target size={17} />
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Your datasets
                </h3>
                <p className="mt-0.5 text-xs text-[#292923]/60">
                  Browse collections and manage their records and fields
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#292923]/65">
              {datasets.length.toLocaleString("en-IN")}{" "}
              {datasets.length === 1 ? "dataset" : "datasets"}
            </span>
          </div>

          {/* Quick actions */}
          <div className="border-b border-slate-300 bg-slate-50/60 px-5 py-4 sm:px-6 sm:py-5">
            <div className="mb-4">
              <h4 className="text-sm font-semibold tracking-tight">
                Quick actions
              </h4>
              <p className="mt-1 text-xs text-[#292923]/55">
                Create and manage your business data.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-300/80 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${action.iconClass}`}
                  >
                    {action.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold text-[#292923]/90">
                      {action.title}
                    </h5>

                    <p className="mt-1 text-xs leading-5 text-[#292923]/55">
                      {action.description}
                    </p>

                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#292923]/75 transition group-hover:text-indigo-700">
                      {action.action}
                      <ArrowUpRight
                        size={13}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Dataset list */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white px-5 py-3 sm:px-6">
            <p className="text-xs text-[#292923]/60">
              <span className="font-semibold text-[#292923]/85">
                {datasets.length.toLocaleString("en-IN")}
              </span>{" "}
              {datasets.length === 1 ? "collection available" : "collections available"}
            </p>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#292923]/55">
              <Database size={14} className="text-[#292923]/40" />
              <span>Business data collections</span>
            </div>
          </div>

          {datasets.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-[#292923]/60">
                <Database size={23} strokeWidth={1.7} />
              </div>

              <h4 className="mt-4 text-sm font-semibold text-[#292923]/90">
                No datasets yet
              </h4>

              <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#292923]/60">
                Create a dataset to organize the business information
                your AI agents can search and use when responding to
                inquiries.
              </p>

              <Link
                href="/datasets/new"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#292923] px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]/85"
              >
                <Plus size={15} />
                Create your first dataset
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
              {datasets.map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.id}`}
                  className="group flex min-w-0 flex-col rounded-xl border border-slate-300/80 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Database size={19} />
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#292923]/60 transition group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                      View details
                      <ArrowUpRight
                        size={13}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>

                  <h4 className="mt-5 truncate text-base font-semibold text-[#292923]/90">
                    {dataset.name}
                  </h4>

                  <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#292923]/55">
                    {dataset.description || "No description provided."}
                  </p>

                  <div className="mt-5 flex items-center gap-8 border-t border-slate-200 pt-4">
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

          {/* Workspace footer */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 bg-white px-5 py-3.5 sm:px-6">
            <p className="text-xs text-[#292923]/50">
              OPTR · Dataset management
            </p>

            <Link
              href="/datasets/new"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292923]/60 transition hover:text-indigo-600"
            >
              <Plus size={13} />
              Add dataset
              <ArrowUpRight size={12} />
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}

function SummaryMetric({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Target;
  accent: "indigo" | "teal" | "amber";
}) {
  const accents = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      marker: "bg-indigo-500",
      glow: "from-indigo-50/70",
    },
    teal: {
      icon: "bg-teal-50 text-teal-700 ring-teal-100",
      marker: "bg-teal-500",
      glow: "from-teal-50/70",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700 ring-amber-100",
      marker: "bg-amber-500",
      glow: "from-amber-50/70",
    },
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${accents.glow} to-transparent opacity-80`}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#292923]/60">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[#292923] tabular-nums">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${accents.icon}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2 border-t border-slate-300 pt-3">
        <span className={`size-1.5 shrink-0 rounded-full ${accents.marker}`} />
        <p className="text-xs text-[#292923]/60">{description}</p>
      </div>
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
      <p className="text-lg font-semibold tracking-tight text-[#292923]/90 tabular-nums">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-0.5 text-xs text-[#292923]/55">{label}</p>
    </div>
  );
}

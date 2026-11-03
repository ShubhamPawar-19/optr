
import Link from "next/link";
import {
    ArrowLeft,
    ArrowUpRight,
    Database,
    FileText,
    Layers3,
    SlidersHorizontal,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import type { DatasetDetail } from "../detail-types";
import { DatasetFieldsTable } from "./dataset-fields-table";

interface DatasetDetailPageProps {
    dataset: DatasetDetail;
}

export function DatasetDetailPage({
    dataset,
}: DatasetDetailPageProps) {
    return (
        <main className="min-h-screen w-full min-w-0 bg-[#F5F7FB] text-[#292923]">
            <div className="mx-auto w-full max-w-[1680px] min-w-0 px-4 pb-10 sm:px-7 lg:px-10">

                {/* Workspace header */}
                <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarToggle />

                        <div className="min-w-0">
                            <nav
                                aria-label="Breadcrumb"
                                className="flex flex-wrap items-center gap-2 text-xs text-[#292923]/50"
                            >
                                <Link
                                    href="/"
                                    className="transition hover:text-[#292923]"
                                >
                                    Workspace
                                </Link>
                                <span className="text-[#292923]/30">/</span>
                                <Link
                                    href="/datasets"
                                    className="transition hover:text-[#292923]"
                                >
                                    Datasets
                                </Link>
                                <span className="text-[#292923]/30">/</span>
                                <span className="font-medium text-[#292923]/75">
                                    Dataset details
                                </span>
                            </nav>

                            <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">
                                {dataset.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Link
                            href={`/datasets/${dataset.id}/schema/edit`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-[#292923]/75 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            <SlidersHorizontal size={15} />
                            <span>Edit schema</span>
                        </Link>

                        <Link
                            href={`/datasets/${dataset.id}/records`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#292923] px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]/85"
                        >
                            <FileText size={15} />
                            <span className="hidden sm:inline">Manage records</span>
                            <span className="sm:hidden">Records</span>
                        </Link>
                    </div>
                </header>

                {/* Page introduction */}
                <section className="flex flex-col justify-between gap-4 pb-6 pt-7 sm:flex-row sm:items-end sm:pb-7 sm:pt-8">
                    <div className="min-w-0">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
                            <span className="size-1.5 rounded-full bg-indigo-500" />
                            Dataset management
                        </div>

                        <h2 className="break-words text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
                            {dataset.name}
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
                            {dataset.description || "No description provided."}
                        </p>
                    </div>

                    <Link
                        href="/datasets"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-[#292923]/75 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                        <ArrowLeft size={15} />
                        Back to datasets
                    </Link>
                </section>

                {/* Dataset overview */}
                <section
                    aria-label="Dataset overview"
                    className="mb-7 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <SummaryCard
                        icon={<FileText size={18} />}
                        label="Total records"
                        value={dataset._count.records}
                        description="Records stored in this dataset"
                        accent="indigo"
                    />

                    <SummaryCard
                        icon={<Layers3 size={18} />}
                        label="Schema fields"
                        value={dataset.fields.length}
                        description="Configured dataset attributes"
                        accent="amber"
                    />

                    <SummaryCard
                        icon={<Database size={18} />}
                        label="Loaded records"
                        value={dataset.records.length}
                        description="Records currently loaded"
                        accent="teal"
                    />
                </section>

                {/* Schema */}
                <section className="mb-7 min-w-0">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight">
                                Schema
                            </h2>
                            <p className="mt-1 text-sm text-[#292923]/55">
                                Fields and settings used to structure this dataset.
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#292923]/65">
                            <span className="size-1.5 rounded-full bg-indigo-500" />
                            {dataset.fields.length}{" "}
                            {dataset.fields.length === 1 ? "field" : "fields"}
                        </span>
                    </div>

                    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
                        <DatasetFieldsTable fields={dataset.fields} />
                    </div>
                </section>

                {/* Records */}
                <section className="min-w-0 overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                                <FileText size={17} />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Records
                                </h2>
                                <p className="mt-0.5 text-xs text-[#292923]/55">
                                    View and manage the data stored in this dataset.
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-[#292923]/65">
                            <span className="size-1.5 rounded-full bg-teal-500" />
                            {dataset._count.records.toLocaleString("en-IN")} total
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-[#292923]/80">
                                Manage dataset records
                            </p>
                            <p className="mt-1 text-xs text-[#292923]/50">
                                Open the records workspace to view, add, and manage entries.
                            </p>
                        </div>

                        <Link
                            href={`/datasets/${dataset.id}/records`}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]/85"
                        >
                            View records
                            <ArrowUpRight size={15} />
                        </Link>
                    </div>
                </section>

                <footer className="mt-8 border-t border-slate-300/80 pt-4">
                    <p className="text-xs text-[#292923]/40">
                        OPTR · Dataset management
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
    description,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    description: string;
    accent: "indigo" | "teal" | "amber";
}) {
    const styles = {
        indigo: {
            icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
            marker: "bg-indigo-500",
        },
        teal: {
            icon: "bg-teal-50 text-teal-700 ring-teal-100",
            marker: "bg-teal-500",
        },
        amber: {
            icon: "bg-amber-50 text-amber-700 ring-amber-100",
            marker: "bg-amber-500",
        },
    }[accent];

    return (
        <div className="rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#292923]/60">
                    {label}
                </p>

                <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${styles.icon}`}
                >
                    {icon}
                </div>
            </div>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#292923] tabular-nums">
                {value.toLocaleString("en-IN")}
            </p>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
                <span className={`size-1.5 rounded-full ${styles.marker}`} />
                <p className="text-xs text-[#292923]/55">
                    {description}
                </p>
            </div>
        </div>
    );
}

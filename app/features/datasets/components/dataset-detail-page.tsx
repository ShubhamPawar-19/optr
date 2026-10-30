
import Link from "next/link";
import {
    ArrowLeft,
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
        <main className="min-h-screen w-full min-w-0 bg-slate-50 text-[#292923]-950">
            <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                <header className="mb-6 flex min-w-0 flex-wrap items-center gap-3 border-b border-slate-400 pb-5">
                    <SidebarToggle />

                    <div className="min-w-0 flex-1">
                        <Link
                            href="/datasets"
                            className="mb-2 inline-flex items-center gap-1.5 text-sm text-[#292923]-500 transition hover:text-[#292923]-950"
                        >
                            <ArrowLeft size={15} />
                            Back to datasets
                        </Link>

                        <div className="flex flex-wrap items-center gap-2">
                            <Database
                                size={18}
                                className="shrink-0 text-[#292923]-500"
                            />
                            <span className="text-sm text-[#292923]-500">
                                Dataset
                            </span>
                            <span className="text-[#292923]-300">/</span>
                            <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight sm:text-2xl">
                                {dataset.name}
                            </h1>
                        </div>

                        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#292923]-500">
                            {dataset.description || "No description provided."}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Link
                            href={`/datasets/${dataset.id}/schema/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-[#292923]-700 transition hover:border-slate-300 hover:bg-[#292923]-100"
                        >
                            <SlidersHorizontal size={16} />
                            <span>Edit schema</span>
                        </Link>

                        <Link
                            href={`/datasets/${dataset.id}/records`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#292923] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#292923]-800 sm:px-4"
                        >
                            <FileText size={16} />
                            <span className="hidden sm:inline">Manage records</span>
                            <span className="sm:hidden">Records</span>
                        </Link>
                    </div>
                </header>

                <section className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        icon={<FileText size={18} />}
                        label="Total records"
                        value={dataset._count.records}
                    />

                    <SummaryCard
                        icon={<Layers3 size={18} />}
                        label="Schema fields"
                        value={dataset.fields.length}
                    />

                    <SummaryCard
                        icon={<Database size={18} />}
                        label="Loaded records"
                        value={dataset.records.length}
                    />
                </section>

                <section className="mb-8 min-w-0">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight">
                                Schema
                            </h2>
                            <p className="mt-1 text-sm text-[#292923]-500">
                                Fields and settings used to structure this dataset.
                            </p>
                        </div>

                        <span className="text-xs text-[#292923]-400">
                            {dataset.fields.length} fields
                        </span>
                    </div>

                    <div className="w-full min-w-0">
                        <DatasetFieldsTable fields={dataset.fields} />
                    </div>
                </section>

                <section className="min-w-0 rounded-xl border border-slate-400 bg-white p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight">
                                Records
                            </h2>

                            <p className="mt-1 text-sm text-[#292923]-500">
                                View and manage the data stored in this dataset.
                            </p>

                            <p className="mt-2 text-sm font-medium text-[#292923]-700">
                                {dataset._count.records.toLocaleString()} total{" "}
                                {dataset._count.records === 1 ? "record" : "records"}
                            </p>
                        </div>

                        <Link
                            href={`/datasets/${dataset.id}/records`}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-400 bg-white px-4 py-2.5 text-sm font-medium text-[#292923]-700 transition hover:bg-[#292923]-50"
                        >
                            View records
                            <ArrowLeft
                                size={15}
                                className="rotate-180"
                            />
                        </Link>
                    </div>
                </section>

                <p className="mt-8 text-xs text-[#292923]-400">
                    Demo workspace · Changes are disabled
                </p>
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
        <div className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-400 bg-white p-5 transition hover:border-slate-300">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#292923]-600">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-sm text-[#292923]-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                    {value.toLocaleString()}
                </p>
            </div>
        </div>
    );
}

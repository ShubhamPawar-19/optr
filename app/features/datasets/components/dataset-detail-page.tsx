import Link from "next/link";
import {
    ArrowLeft,
    Database,
    FileText,
    Layers3,
    Plus,
} from "lucide-react";

import type { DatasetDetail } from "../detail-types";
import { DatasetFieldsTable } from "./dataset-fields-table";
import { DatasetRecordsTable } from "./dataset-records-table";

interface DatasetDetailPageProps {
    dataset: DatasetDetail;
}

export function DatasetDetailPage({
    dataset,
}: DatasetDetailPageProps) {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                <Link
                    href="/datasets"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-950"
                >
                    <ArrowLeft size={16} />
                    Back to datasets
                </Link>

                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                            <Database size={16} />
                            <span>Dataset</span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight">
                            {dataset.name}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {dataset.description || "No description provided."}
                        </p>
                    </div>

                    <Link
                        href={`/datasets/${dataset.id}/records/new`}
                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        Add Record
                    </Link>
                </header>

                <section className="mb-8 grid gap-4 sm:grid-cols-3">
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

                <section className="mb-8">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold">Schema</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fields and settings used to structure this dataset.
                        </p>
                    </div>

                    <DatasetFieldsTable fields={dataset.fields} />
                </section>

                <section>
                    <div className="mb-4">
                        <h2 className="text-base font-semibold">Records</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Data stored in this dataset, with columns generated from its
                            schema.
                        </p>
                    </div>

                    <DatasetRecordsTable
                        datasetId={dataset.id}
                        fields={dataset.fields}
                        records={dataset.records}
                        totalRecords={dataset._count.records}
                    />
                </section>

                <p className="mt-8 text-xs text-slate-400">
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
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
                {icon}
                {label}
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
                {value.toLocaleString()}
            </p>
        </div>
    );
}
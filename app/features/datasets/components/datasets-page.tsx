
import Link from "next/link";
import {
    ArrowUpRight,
    Database,
    FileText,
    Layers3,
    Plus,
} from "lucide-react";

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
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                            <Link href="/" className="hover:text-slate-950">
                                Workspace
                            </Link>
                            <span>/</span>
                            <span className="text-slate-900">Datasets</span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight">
                            Datasets
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Manage the structured information your AI agents use to answer
                            questions and complete tasks.
                        </p>
                    </div>


                    <Link
                        href="/datasets/new"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        New dataset
                    </Link>

                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
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
                </div>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold">Your data</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Structured collections available to your agents.
                            </p>
                        </div>

                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            {datasets.length} {datasets.length === 1 ? "dataset" : "datasets"}
                        </span>
                    </div>

                    {datasets.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Database size={22} />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold">
                                No datasets yet
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                Datasets will appear here when they are created for this
                                workspace.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {datasets.map((dataset) => (
                                <Link
                                    key={dataset.id}
                                    href={`/datasets/${dataset.id}`}
                                    className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                                            <Database size={20} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                            View details
                                            <ArrowUpRight size={14} />
                                        </span>
                                    </div>

                                    <h3 className="mt-4 truncate text-base font-semibold">
                                        {dataset.name}
                                    </h3>

                                    <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">
                                        {dataset.description || "No description provided."}
                                    </p>

                                    <div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-4">
                                        <Count label="Records" value={dataset._count.records} />
                                        <Count label="Fields" value={dataset._count.fields} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <p className="mt-8 text-xs text-slate-400">
                    Demo workspace · Read-only preview
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

function Count({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-lg font-semibold">{value.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
    );
}

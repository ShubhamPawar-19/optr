
"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    ChevronDown,
    CircleAlert,
    Database,
    FileText,
    Hash,
    Image,
    Link2,
    Plus,
    Power,
    Search,
    SlidersHorizontal,
    Trash2,
    Type,
    X,
} from "lucide-react";

import {
    createLeadFieldAction,
    updateLeadFieldAction,
    toggleLeadFieldAction,
    deleteLeadFieldAction,
    type LeadFieldActionState,
} from "../actions";

type LeadField = {
    id: string;
    key: string;
    label: string;
    description: string | null;
    type: string;
    isRequired: boolean;
    isActive: boolean;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        values: number;
    };
};

type LeadFieldsPageProps = {
    fields: LeadField[];
};

const initialState: LeadFieldActionState = {};

const FIELD_TYPES = [
    { value: "TEXT", label: "Text", description: "Names, preferences and general information", icon: Type },
    { value: "NUMBER", label: "Number", description: "Budgets, quantities and numeric values", icon: Hash },
    { value: "BOOLEAN", label: "Yes / No", description: "True or false information", icon: Check },
    { value: "DATE", label: "Date", description: "Dates and deadlines", icon: Database },
    { value: "URL", label: "URL", description: "External links", icon: Link2 },
    { value: "MEDIA", label: "Media", description: "Image and media URLs", icon: Image },
] as const;

function makeKey(label: string) {
    return label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/^[^a-z]+/, "");
}

function FieldForm({
    field,
    onCancel,
}: {
    field?: LeadField;
    onCancel?: () => void;
}) {
    const isEditing = Boolean(field);

    const [createState, createAction, createPending] = useActionState(
        createLeadFieldAction,
        initialState,
    );

    const [updateState, updateAction, updatePending] = useActionState(
        updateLeadFieldAction,
        initialState,
    );

    const [label, setLabel] = useState(field?.label ?? "");
    const [key, setKey] = useState(field?.key ?? "");
    const [description, setDescription] = useState(field?.description ?? "");
    const [type, setType] = useState(field?.type ?? "TEXT");
    const [isRequired, setIsRequired] = useState(field?.isRequired ?? false);
    const [keyEdited, setKeyEdited] = useState(Boolean(field));

    const pending = isEditing ? updatePending : createPending;
    const state = isEditing ? updateState : createState;

    return (
        <form
            action={isEditing ? updateAction : createAction}
            className="space-y-5"
        >
            {isEditing && (
                <input type="hidden" name="id" value={field!.id} />
            )}

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Field name
                </label>
                <input
                    name="label"
                    required
                    maxLength={100}
                    value={label}
                    onChange={(event) => {
                        const value = event.target.value;
                        setLabel(value);

                        if (!isEditing && !keyEdited) {
                            setKey(makeKey(value));
                        }
                    }}
                    placeholder="e.g. Property budget"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
            </div>

            {!isEditing && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Field key
                    </label>
                    <input
                        name="key"
                        required
                        maxLength={100}
                        pattern="[a-z][a-z0-9_]*"
                        value={key}
                        onChange={(event) => {
                            setKey(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                            setKeyEdited(true);
                        }}
                        placeholder="property_budget"
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                    <p className="mt-1.5 text-xs text-slate-400">
                        Lowercase letters, numbers and underscores. Must start with a letter.
                    </p>
                </div>
            )}

            {isEditing && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Field key
                    </label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-xs text-slate-500">
                        {field!.key}
                    </div>
                    <input type="hidden" name="key" value={field!.key} />
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                </label>
                <textarea
                    name="description"
                    maxLength={500}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe what information this field should capture..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Field type
                </label>
                <div className="relative">
                    <select
                        name="type"
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    >
                        {FIELD_TYPES.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                    {FIELD_TYPES.find((item) => item.value === type)?.description}
                </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
                <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(event) => setIsRequired(event.target.checked)}
                    className="mt-0.5 size-4 accent-indigo-600"
                />
                <input
                    type="hidden"
                    name="isRequired"
                    value={String(isRequired)}
                />
                <span>
                    <span className="block text-sm font-medium text-slate-800">
                        Important qualification field
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Mark this information as important when evaluating lead qualification.
                        This does not prevent a lead from being created.
                    </span>
                </span>
            </label>

            {state.error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            {state.success && (
                <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                    {state.success}
                </p>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                    {pending ? "Saving..." : isEditing ? "Save changes" : "Create field"}
                </button>
            </div>
        </form>
    );
}

function FieldActions({ field }: { field: LeadField }) {
    const [toggleState, toggleAction, togglePending] = useActionState(
        toggleLeadFieldAction,
        initialState,
    );

    const [deleteState, deleteAction, deletePending] = useActionState(
        deleteLeadFieldAction,
        initialState,
    );

    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
                <form action={toggleAction}>
                    <input type="hidden" name="fieldId" value={field.id} />
                    <input
                        type="hidden"
                        name="isActive"
                        value={String(!field.isActive)}
                    />
                    <button
                        type="submit"
                        disabled={togglePending}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <Power size={13} />
                        {togglePending
                            ? "Saving..."
                            : field.isActive
                                ? "Deactivate"
                                : "Activate"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deletePending || field._count.values > 0}
                    title={
                        field._count.values > 0
                            ? "Deactivate this field instead because it contains saved values"
                            : "Delete field"
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2 size={13} />
                    Delete
                </button>
            </div>

            {toggleState.error && (
                <p role="alert" className="text-xs text-red-600">
                    {toggleState.error}
                </p>
            )}

            {deleteState.error && (
                <p role="alert" className="text-xs text-red-600">
                    {deleteState.error}
                </p>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={20} />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            Delete lead field?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Are you sure you want to delete <strong>{field.label}</strong>?
                            This action cannot be undone.
                        </p>

                        {deleteState.error && (
                            <p role="alert" className="mt-3 text-sm text-red-600">
                                {deleteState.error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                disabled={deletePending}
                                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600"
                            >
                                Cancel
                            </button>

                            <form
                                action={async (formData) => {
                                    await deleteAction(formData);
                                    setConfirmDelete(false);
                                }}
                            >
                                <input type="hidden" name="fieldId" value={field.id} />
                                <button
                                    type="submit"
                                    disabled={deletePending}
                                    className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deletePending ? "Deleting..." : "Delete field"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function LeadFieldsPage({ fields }: LeadFieldsPageProps) {
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [editingField, setEditingField] = useState<LeadField | null>(null);

    const filteredFields = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return fields;

        return fields.filter((field) =>
            [field.label, field.key, field.description, field.type]
                .some((value) => value?.toLowerCase().includes(query)),
        );
    }, [fields, search]);

    const activeCount = fields.filter((field) => field.isActive).length;
    const requiredCount = fields.filter((field) => field.isRequired).length;
    const savedValues = fields.reduce(
        (total, field) => total + field._count.values,
        0,
    );

    return (
        <main className="min-h-screen bg-[#F5F7FB] text-slate-900">
            <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-7 lg:px-10">
                <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Link href="/leads" className="hover:text-slate-700">
                                Leads
                            </Link>
                            <span>/</span>
                            <span className="font-medium text-slate-700">Lead fields</span>
                        </div>
                        <h1 className="mt-1 text-lg font-semibold tracking-tight">
                            Configure lead fields
                        </h1>
                    </div>

                    <Link
                        href="/leads"
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft size={15} />
                        <span className="hidden sm:inline">Back to leads</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                </header>

                <section className="flex flex-col justify-between gap-4 pb-6 pt-8 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700">
                            <SlidersHorizontal size={13} />
                            Lead configuration
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Define what matters in a lead.
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Configure the information your AI agents should capture when
                            qualifying customer inquiries.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingField(null);
                            setShowCreate(true);
                        }}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        Add field
                    </button>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <Metric
                        label="Total fields"
                        value={fields.length}
                        description="Configured lead attributes"
                        icon={FileText}
                    />
                    <Metric
                        label="Active fields"
                        value={activeCount}
                        description="Available for lead extraction"
                        icon={Check}
                    />
                    <Metric
                        label="Saved values"
                        value={savedValues}
                        description={`${requiredCount} important qualification fields`}
                        icon={Database}
                    />
                </section>

                <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="font-semibold">Your lead fields</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Manage the attributes associated with each business opportunity.
                            </p>
                        </div>

                        <div className="relative sm:w-72">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search fields..."
                                className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredFields.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                {fields.length === 0 ? (
                                    <Database size={22} />
                                ) : (
                                    <Search size={22} />
                                )}
                            </div>
                            <h3 className="mt-4 text-sm font-semibold">
                                {fields.length === 0
                                    ? "No lead fields configured"
                                    : "No matching fields"}
                            </h3>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                {fields.length === 0
                                    ? "Create fields such as budget, preferred location or property type to organize your opportunities."
                                    : "Try searching with another field name or type."}
                            </p>
                            {fields.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(true)}
                                    className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white"
                                >
                                    <Plus size={14} />
                                    Create your first field
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredFields.map((field) => {
                                const typeInfo = FIELD_TYPES.find(
                                    (item) => item.value === field.type,
                                );
                                const Icon = typeInfo?.icon ?? Type;

                                return (
                                    <div
                                        key={field.id}
                                        className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                                                <Icon size={17} />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-sm font-semibold text-slate-800">
                                                        {field.label}
                                                    </h4>
                                                    {field.isRequired && (
                                                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                            IMPORTANT
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${field.isActive
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                            }`}
                                                    >
                                                        {field.isActive ? "ACTIVE" : "INACTIVE"}
                                                    </span>
                                                </div>

                                                <p className="mt-1 font-mono text-xs text-slate-400">
                                                    {field.key}
                                                </p>

                                                {field.description && (
                                                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                                        {field.description}
                                                    </p>
                                                )}

                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                                    <span>{typeInfo?.label ?? field.type}</span>
                                                    <span>·</span>
                                                    <span>
                                                        {field._count.values.toLocaleString("en-IN")} saved values
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreate(false);
                                                    setEditingField(field);
                                                }}
                                                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <FieldActions field={field} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <footer className="border-t border-slate-200 bg-slate-50/70 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Showing {filteredFields.length} of {fields.length} fields.
                            Fields with saved values cannot be deleted.
                        </p>
                    </footer>
                </section>

                <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    <CircleAlert size={15} className="mt-0.5 shrink-0" />
                    <p>
                        Important fields help define what information matters during
                        qualification. They do not force the AI to invent missing
                        information or prevent a lead from being created.
                    </p>
                </div>
            </div>

            {(showCreate || editingField) && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowCreate(false);
                            setEditingField(null);
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {editingField ? "Edit lead field" : "Create lead field"}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Configure an attribute for your business opportunities.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreate(false);
                                    setEditingField(null);
                                }}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <FieldForm
                            key={editingField?.id ?? "new"}
                            field={editingField ?? undefined}
                            onCancel={() => {
                                setShowCreate(false);
                                setEditingField(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

function Metric({
    label,
    value,
    description,
    icon: Icon,
}: {
    label: string;
    value: number;
    description: string;
    icon: typeof Database;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                        {value.toLocaleString("en-IN")}
                    </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={18} />
                </div>
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                {description}
            </p>
        </div>
    );
}

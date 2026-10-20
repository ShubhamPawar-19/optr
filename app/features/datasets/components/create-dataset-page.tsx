"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
    createDatasetAction,
    type CreateDatasetActionState,
} from "../actions";

const FIELD_TYPES = [
    "TEXT",
    "NUMBER",
    "BOOLEAN",
    "DATE",
    "SINGLE_SELECT",
    "MULTI_SELECT",
    "URL",
    "MEDIA",
] as const;

type FieldType = (typeof FIELD_TYPES)[number];

interface FieldDraft {
    id: string;
    label: string;
    key: string;
    type: FieldType;
    isRequired: boolean;
    isSearchable: boolean;
    optionsText: string;
}

function toFieldKey(label: string) {
    return label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function createField(): FieldDraft {
    return {
        id: crypto.randomUUID(),
        label: "",
        key: "",
        type: "TEXT",
        isRequired: false,
        isSearchable: true,
        optionsText: "",
    };
}

export function CreateDatasetPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState<FieldDraft[]>([createField()]);
    const initialState: CreateDatasetActionState = {};
    const [serverState, formAction, isPending] = useActionState(
        createDatasetAction,
        initialState,
    );
    const [error, setError] = useState("");
    function updateField(id: string, updates: Partial<FieldDraft>) {
        setFields((current) =>
            current.map((field) =>
                field.id === id ? { ...field, ...updates } : field,
            ),
        );
    }

    function handleLabelChange(field: FieldDraft, label: string) {
        updateField(field.id, {
            label,
            key: toFieldKey(label),
        });
    }


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        setError("");

        if (!name.trim()) {
            event.preventDefault();
            setError("Enter a dataset name.");
            return;
        }

        if (fields.some((field) => !field.label.trim())) {
            event.preventDefault();
            setError("Every field needs a label.");
            return;
        }

        const keys = fields.map((field) => field.key);

        if (keys.some((key) => !key) || new Set(keys).size !== keys.length) {
            event.preventDefault();
            setError("Field labels must generate unique, valid keys.");
            return;
        }

        const invalidOptions = fields.find((field) => {
            if (!["SINGLE_SELECT", "MULTI_SELECT"].includes(field.type)) {
                return false;
            }

            const options = field.optionsText.split(",").map((option) => option.trim());

            return (
                options.length === 0 ||
                options.some((option) => !option) ||
                new Set(options).size !== options.length
            );
        });

        if (invalidOptions) {
            event.preventDefault();
            setError(
                `Enter unique, comma-separated options for "${invalidOptions.label}".`,
            );
        }
    }


    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
                <Link
                    href="/datasets"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
                >
                    <ArrowLeft size={16} />
                    Back to datasets
                </Link>

                <div className="mt-6">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create dataset
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Define the fields your agents will use to store and retrieve structured data.
                    </p>
                </div>

                <form
                    action={formAction}
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                >
                    <input type="hidden" name="name" value={name} />
                    <input type="hidden" name="description" value={description} />
                    <input
                        type="hidden"
                        name="fields"
                        value={JSON.stringify(
                            fields.map((field) => ({
                                label: field.label,
                                key: field.key,
                                type: field.type,
                                isRequired: field.isRequired,
                                isSearchable: field.isSearchable,
                                options: ["SINGLE_SELECT", "MULTI_SELECT"].includes(field.type)
                                    ? field.optionsText.split(",").map((option) => option.trim())
                                    : undefined,
                            })),
                        )}
                    />
                    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                        <h2 className="text-base font-semibold">Dataset details</h2>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="dataset-name" className="text-sm font-medium">
                                    Dataset name *
                                </label>
                                <input
                                    id="dataset-name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="e.g. Properties"
                                    maxLength={100}
                                    required
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="dataset-description" className="text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    id="dataset-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="What information does this dataset contain?"
                                    rows={3}
                                    maxLength={500}
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-base font-semibold">Fields</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Each field defines the type of value a record can contain.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setFields((current) => [...current, createField()])}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                            >
                                <Plus size={16} />
                                Add field
                            </button>
                        </div>

                        <div className="mt-5 space-y-5">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="rounded-lg border border-slate-200 p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm font-semibold">Field {index + 1}</p>
                                        <button
                                            type="button"
                                            disabled={fields.length === 1}
                                            onClick={() =>
                                                setFields((current) =>
                                                    current.filter((item) => item.id !== field.id),
                                                )
                                            }
                                            aria-label={`Remove field ${index + 1}`}
                                            className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Field label *
                                            </label>
                                            <input
                                                value={field.label}
                                                onChange={(event) =>
                                                    handleLabelChange(field, event.target.value)
                                                }
                                                placeholder="e.g. Property title"
                                                maxLength={100}
                                                required
                                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">Field key</label>
                                            <input
                                                value={field.key}
                                                readOnly
                                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">Field type</label>
                                            <select
                                                value={field.type}
                                                onChange={(event) =>
                                                    updateField(field.id, {
                                                        type: event.target.value as FieldType,
                                                    })
                                                }
                                                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                            >
                                                {FIELD_TYPES.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type.replaceAll("_", " ")}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {["SINGLE_SELECT", "MULTI_SELECT"].includes(field.type) && (
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Options *
                                                </label>
                                                <input
                                                    value={field.optionsText}
                                                    onChange={(event) =>
                                                        updateField(field.id, {
                                                            optionsText: event.target.value,
                                                        })
                                                    }
                                                    placeholder="Available, Pending, Sold"
                                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                />
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Separate options with commas.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={field.isRequired}
                                                onChange={(event) =>
                                                    updateField(field.id, {
                                                        isRequired: event.target.checked,
                                                    })
                                                }
                                                className="rounded border-slate-300"
                                            />
                                            Required
                                        </label>

                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={field.isSearchable}
                                                onChange={(event) =>
                                                    updateField(field.id, {
                                                        isSearchable: event.target.checked,
                                                    })
                                                }
                                                className="rounded border-slate-300"
                                            />
                                            Searchable by agents
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>


                    {(error || serverState.error) && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error || serverState.error}
                        </p>
                    )}


                    <div className="flex justify-end gap-3">
                        <Link
                            href="/datasets"
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? "Creating dataset..." : "Create dataset"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

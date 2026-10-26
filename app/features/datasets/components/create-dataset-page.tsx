"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Database,
  Layers3,
  Check,
  ChevronDown,
  Info,
} from "lucide-react";
import { SidebarToggle } from "@/app/components/sidebar-toggle";
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

function fieldTypeLabel(type: FieldType) {
  return type.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) =>
    letter.toUpperCase()
  );
}

const inputClass =
  "mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

export function CreateDatasetPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([createField()]);
  const initialState: CreateDatasetActionState = {};
  const [serverState, formAction, isPending] = useActionState(
    createDatasetAction,
    initialState
  );
  const [error, setError] = useState("");

  function updateField(id: string, updates: Partial<FieldDraft>) {
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
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

      const options = field.optionsText
        .split(",")
        .map((option) => option.trim());

      return (
        options.length === 0 ||
        options.some((option) => !option) ||
        new Set(options).size !== options.length
      );
    });

    if (invalidOptions) {
      event.preventDefault();
      setError(
        `Enter unique, comma-separated options for "${invalidOptions.label}".`
      );
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-50/80 text-slate-950">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Top navigation */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />
            <div className="h-5 w-px bg-slate-200" />
            <Link
              href="/datasets"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              <span>Datasets</span>
            </Link>
          </div>

          <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 sm:inline-flex">
            <Database className="size-3.5" />
            Dataset setup
          </span>
        </div>

        {/* Page introduction */}
        <div className="mb-8 mt-8 flex items-start gap-4 sm:mb-10 sm:mt-10">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm sm:flex">
            <Database className="size-5 text-slate-700" />
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Data management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Create a dataset
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
              Define a structured collection of information your agents can
              search and use when responding to customers.
            </p>
          </div>
        </div>

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-6"
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
              }))
            )}
          />

          {/* Dataset details */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Database className="size-4 text-slate-700" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Dataset details
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Start with a name and a short description of the data.
                </p>
              </div>
            </div>

            <div className="grid gap-5 px-5 py-6 sm:px-6">
              <div>
                <label
                  htmlFor="dataset-name"
                  className="text-sm font-medium text-slate-800"
                >
                  Dataset name <span className="text-red-500">*</span>
                </label>
                <input
                  id="dataset-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Property listings"
                  maxLength={100}
                  required
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Choose a name that describes the records in this collection.
                </p>
              </div>

              <div>
                <label
                  htmlFor="dataset-description"
                  className="text-sm font-medium text-slate-800"
                >
                  Description <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="dataset-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe what this dataset contains and when agents should use it."
                  rows={3}
                  maxLength={500}
                  className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-[11px] tabular-nums text-slate-400">
                    {description.length}/500
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Fields */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Layers3 className="size-4 text-slate-700" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Define fields
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choose the information stored on each record.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFields((current) => [...current, createField()])}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Plus className="size-4" />
                Add field
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {field.label.trim() || `Untitled field ${index + 1}`}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {field.key || "Field key will be generated"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={fields.length === 1}
                      onClick={() =>
                        setFields((current) =>
                          current.filter((item) => item.id !== field.id)
                        )
                      }
                      aria-label={`Remove field ${index + 1}`}
                      title="Remove field"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                    <div>
                      <label
                        htmlFor={`field-label-${field.id}`}
                        className="text-xs font-medium text-slate-700"
                      >
                        Field label <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`field-label-${field.id}`}
                        value={field.label}
                        onChange={(event) =>
                          handleLabelChange(field, event.target.value)
                        }
                        placeholder="e.g. Property title"
                        maxLength={100}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`field-key-${field.id}`}
                        className="text-xs font-medium text-slate-700"
                      >
                        Field key
                      </label>
                      <input
                        id={`field-key-${field.id}`}
                        value={field.key}
                        readOnly
                        aria-describedby={`field-key-help-${field.id}`}
                        className={`${inputClass} bg-slate-50 font-mono text-xs text-slate-500`}
                      />
                      <p
                        id={`field-key-help-${field.id}`}
                        className="mt-1.5 text-[11px] text-slate-400"
                      >
                        Used internally by agents and tools.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor={`field-type-${field.id}`}
                        className="text-xs font-medium text-slate-700"
                      >
                        Field type
                      </label>
                      <div className="relative">
                        <select
                          id={`field-type-${field.id}`}
                          value={field.type}
                          onChange={(event) =>
                            updateField(field.id, {
                              type: event.target.value as FieldType,
                            })
                          }
                          className={`${inputClass} appearance-none pr-9 capitalize`}
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {fieldTypeLabel(type)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    {["SINGLE_SELECT", "MULTI_SELECT"].includes(field.type) && (
                      <div>
                        <label
                          htmlFor={`field-options-${field.id}`}
                          className="text-xs font-medium text-slate-700"
                        >
                          Options <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`field-options-${field.id}`}
                          value={field.optionsText}
                          onChange={(event) =>
                            updateField(field.id, {
                              optionsText: event.target.value,
                            })
                          }
                          placeholder="Available, Pending, Sold"
                          required
                          className={inputClass}
                        />
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          Separate values with commas. Each option must be unique.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Info className="size-3.5 shrink-0" />
                      Configure how this field is used.
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(event) =>
                            updateField(field.id, {
                              isRequired: event.target.checked,
                            })
                          }
                          className="size-3.5 rounded border-slate-300 accent-slate-900 focus:ring-slate-400"
                        />
                        Required
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={field.isSearchable}
                          onChange={(event) =>
                            updateField(field.id, {
                              isSearchable: event.target.checked,
                            })
                          }
                          className="size-3.5 rounded border-slate-300 accent-slate-900 focus:ring-slate-400"
                        />
                        Searchable by agents
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setFields((current) => [...current, createField()])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                <Plus className="size-4" />
                Add another field
              </button>
            </div>
          </section>

          {(error || serverState.error) && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error || serverState.error}
            </p>
          )}

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              {fields.length} {fields.length === 1 ? "field" : "fields"} configured
            </p>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/datasets"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Create dataset
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

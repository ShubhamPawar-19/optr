
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Database,
  FilePlus2,
  Info,
  Layers3,
  Plus,
  Trash2,
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
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

const inputClass =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const labelClass = "block text-sm font-medium text-slate-700";

export function CreateDatasetPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([createField()]);
  const [error, setError] = useState("");

  const initialState: CreateDatasetActionState = {};

  const [serverState, formAction, isPending] = useActionState(
    createDatasetAction,
    initialState,
  );

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
        `Enter unique, comma-separated options for "${invalidOptions.label}".`,
      );
    }
  }

  function addField() {
    setFields((current) => [...current, createField()]);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div className="h-5 w-px bg-slate-200" />
            <Link
              href="/datasets"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Datasets
            </Link>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <Database size={14} />
            Dataset setup
          </span>
        </div>

        {/* Page heading */}
        <header className="mb-8 mt-9 sm:mb-10">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <FilePlus2 size={21} className="text-slate-700" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Create a dataset
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Organize your business information into structured records that
            your AI agents can search and use to answer customer inquiries.
          </p>
        </header>

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
              })),
            )}
          />

          {/* Dataset details */}
          <section className="overflow-hidden rounded-xl p-6 border border-slate-200 bg-white">
            <SectionHeader
              icon={<Database size={18} />}
              title="Dataset details"
              description="Give this collection a clear name and purpose."
            />

            <div className="grid gap-5 p-5 sm:p-6">
              <div>
                <label htmlFor="dataset-name" className={labelClass}>
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
                  Use a short name that describes the records in this dataset.
                </p>
              </div>

              <div>
                <label htmlFor="dataset-description" className={labelClass}>
                  Description{" "}
                  <span className="font-normal text-slate-400">Optional</span>
                </label>
                <textarea
                  id="dataset-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What information does this dataset contain? When should agents use it?"
                  rows={3}
                  maxLength={500}
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <p className="mt-1 text-right text-xs tabular-nums text-slate-400">
                  {description.length}/500
                </p>
              </div>
            </div>
          </section>

          {/* Field configuration */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <SectionHeader
                icon={<Layers3 size={18} />}
                title="Fields"
                description="Define the information each record can contain."
              />

              <button
                type="button"
                onClick={addField}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Plus size={15} />
                Add field
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {fields.map((field, index) => (
                <article
                  key={field.id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {field.label.trim() || `Untitled field ${index + 1}`}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-xs text-slate-400">
                          {field.key || "field_key"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={fields.length === 1}
                      onClick={() =>
                        setFields((current) =>
                          current.filter((item) => item.id !== field.id),
                        )
                      }
                      aria-label={`Remove field ${index + 1}`}
                      title="Remove field"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
                    <div>
                      <label
                        htmlFor={`field-label-${field.id}`}
                        className={labelClass}
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
                        className={labelClass}
                      >
                        Field key
                      </label>
                      <input
                        id={`field-key-${field.id}`}
                        value={field.key}
                        readOnly
                        className={`${inputClass} bg-slate-50 font-mono text-xs text-slate-500`}
                      />
                      <p className="mt-1.5 text-xs text-slate-400">
                        Generated automatically from the label.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor={`field-type-${field.id}`}
                        className={labelClass}
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
                          className={`${inputClass} appearance-none pr-9`}
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {fieldTypeLabel(type)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>

                    {["SINGLE_SELECT", "MULTI_SELECT"].includes(field.type) && (
                      <div>
                        <label
                          htmlFor={`field-options-${field.id}`}
                          className={labelClass}
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
                        <p className="mt-1.5 text-xs text-slate-400">
                          Separate options with commas. Values must be unique.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Info size={14} />
                      Field settings
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(event) =>
                            updateField(field.id, {
                              isRequired: event.target.checked,
                            })
                          }
                          className="size-4 rounded border-slate-300 accent-slate-900"
                        />
                        Required
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={field.isSearchable}
                          onChange={(event) =>
                            updateField(field.id, {
                              isSearchable: event.target.checked,
                            })
                          }
                          className="size-4 rounded border-slate-300 accent-slate-900"
                        />
                        Searchable by agents
                      </label>
                    </div>
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={addField}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                <Plus size={16} />
                Add another field
              </button>
            </div>
          </section>

          {(error || serverState.error) && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error || serverState.error}
            </p>
          )}

          {/* Submit area */}
          <div className="flex flex-col-reverse gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
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
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={16} />
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

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
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
  "mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#292923] outline-none transition placeholder:text-[#292923]/35 hover:border-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const labelClass = "block text-sm font-medium text-[#292923]/80";

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
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Workspace header */}
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-xs text-[#292923]/50"
              >
                <Link
                  href="/datasets"
                  className="transition hover:text-[#292923]/75"
                >
                  Datasets
                </Link>
                <Link
                  href="/datasets/new"
                  className="font-bold text-[#292923]"
                >
                <span className="font-bold text-[#292923]/75">
                  Create
                </span>
                </Link>
              </nav>
            </div>
          </div>

          <Link
            href="/datasets"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-[#292923]/75 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
            Back to datasets
          </Link>
        </header>

        {/* Page introduction */}
        <section className="pb-6 pt-7 sm:pb-7 sm:pt-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            Dataset configuration
          </div>

          <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
            Build your business data collection.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
            Organize your business information into structured records
            that your AI agents can search and use to answer customer
            inquiries.
          </p>
        </section>

        {/* Configuration overview */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <OverviewCard
            icon={<Database size={18} />}
            label="Dataset"
            value={name.trim() || "Not named yet"}
            description="Your collection name"
            accent="indigo"
          />

          <OverviewCard
            icon={<Layers3 size={18} />}
            label="Fields"
            value={fields.length.toLocaleString("en-IN")}
            description="Configured attributes"
            accent="teal"
          />

          <OverviewCard
            icon={<FilePlus2 size={18} />}
            label="Required fields"
            value={fields.filter((field) => field.isRequired).length.toLocaleString("en-IN")}
            description="Mandatory record attributes"
            accent="amber"
          />
        </section>

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
          <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Database size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  Dataset details
                </h3>
                <p className="mt-0.5 text-xs text-[#292923]/55">
                  Give this collection a clear name and purpose.
                </p>
              </div>
            </div>

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

                <p className="mt-1.5 text-xs text-[#292923]/45">
                  Use a short name that describes the records in this dataset.
                </p>
              </div>

              <div>
                <label htmlFor="dataset-description" className={labelClass}>
                  Description{" "}
                  <span className="font-normal text-[#292923]/40">
                    Optional
                  </span>
                </label>

                <textarea
                  id="dataset-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What information does this dataset contain? When should agents use it?"
                  rows={3}
                  maxLength={500}
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-[#292923]/35 hover:border-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-right text-xs tabular-nums text-[#292923]/40">
                  {description.length}/500
                </p>
              </div>
            </div>
          </section>

          {/* Field configuration */}
          <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-teal-700">
                  <Layers3 size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Fields
                  </h3>
                  <p className="mt-0.5 text-xs text-[#292923]/55">
                    Define the information each record can contain.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addField}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#292923] px-3.5 text-sm font-medium text-white transition hover:bg-[#292923]/85"
              >
                <Plus size={15} />
                Add field
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {fields.map((field, index) => (
                <article
                  key={field.id}
                  className="overflow-hidden rounded-xl border border-slate-300/80 bg-white transition hover:border-slate-400"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#292923]/70">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#292923]/90">
                          {field.label.trim() || `Untitled field ${index + 1}`}
                        </p>

                        <p className="mt-0.5 truncate font-mono text-xs text-[#292923]/40">
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
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#292923]/40 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
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
                        className={`${inputClass} bg-slate-50 font-mono text-xs text-[#292923]/55`}
                      />

                      <p className="mt-1.5 text-xs text-[#292923]/40">
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
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#292923]/40"
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

                        <p className="mt-1.5 text-xs text-[#292923]/40">
                          Separate options with commas. Values must be unique.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#292923]/55">
                      <Info size={14} />
                      Field settings
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#292923]/70">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(event) =>
                            updateField(field.id, {
                              isRequired: event.target.checked,
                            })
                          }
                          className="size-4 rounded border-slate-300 accent-indigo-600"
                        />
                        Required
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#292923]/70">
                        <input
                          type="checkbox"
                          checked={field.isSearchable}
                          onChange={(event) =>
                            updateField(field.id, {
                              isSearchable: event.target.checked,
                            })
                          }
                          className="size-4 rounded border-slate-300 accent-indigo-600"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-4 text-sm font-medium text-[#292923]/60 transition hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700"
              >
                <Plus size={16} />
                Add another field
              </button>
            </div>
          </section>

          {/* Form errors */}
          {(error || serverState.error) && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error || serverState.error}
            </p>
          )}

          {/* Form footer */}
          <div className="flex flex-col-reverse gap-4 rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#292923]/80">
                Ready to create your dataset?
              </p>
              <p className="mt-1 text-xs text-[#292923]/50">
                {fields.length} {fields.length === 1 ? "field" : "fields"} configured
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/datasets"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#292923]/75 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <ArrowUpRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <footer className="mt-8 border-t border-slate-300/80 pt-4">
          <p className="text-xs text-[#292923]/40">
            OPTR · Dataset management
          </p>
        </footer>
      </div>
    </main>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  description,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
        <p className="text-sm font-medium text-[#292923]/60">{label}</p>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${styles.icon}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-2 truncate text-xl font-semibold tracking-tight text-[#292923]">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
        <span className={`size-1.5 rounded-full ${styles.marker}`} />
        <p className="text-xs text-[#292923]/55">{description}</p>
      </div>
    </div>
  );
}

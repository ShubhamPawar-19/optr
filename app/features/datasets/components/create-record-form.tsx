
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
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import {
  createDatasetRecordAction,
  type CreateRecordActionState,
} from "../actions";
import type { DatasetFieldSummary } from "../detail-types";

interface CreateRecordFormProps {
  datasetId: string;
  fields: DatasetFieldSummary[];
}

type FieldValue = string | boolean | string[];

const initialState: CreateRecordActionState = {};

export function CreateRecordForm({
  datasetId,
  fields,
}: CreateRecordFormProps) {
  const [serverState, formAction, isPending] = useActionState(
    createDatasetRecordAction,
    initialState,
  );

  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [clientError, setClientError] = useState("");

  function updateValue(key: string, value: FieldValue) {
    setValues((current) => ({ ...current, [key]: value }));
    setClientError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setClientError("");

    for (const field of fields) {
      const value = values[field.key];

      const isEmpty =
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (field.isRequired && isEmpty) {
        event.preventDefault();
        setClientError(`"${field.label}" is required.`);
        return;
      }

      if (field.type === "NUMBER" && value !== undefined && value !== "") {
        if (typeof value !== "string" || !Number.isFinite(Number(value))) {
          event.preventDefault();
          setClientError(`"${field.label}" must be a valid number.`);
          return;
        }
      }

      if (field.type === "MEDIA" && typeof value === "string") {
        const urls = value
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean);

        const invalidUrl = urls.find((url) => {
          try {
            const parsed = new URL(url);
            return (
              parsed.protocol !== "https:" && parsed.protocol !== "http:"
            );
          } catch {
            return true;
          }
        });

        if (invalidUrl) {
          event.preventDefault();
          setClientError(
            `"${field.label}" contains an invalid HTTP or HTTPS URL.`,
          );
          return;
        }
      }
    }
  }

  function serializeValues(): string {
    const data: Record<string, unknown> = {};

    for (const field of fields) {
      const value = values[field.key];

      if (value === undefined || value === "") continue;

      if (field.type === "NUMBER") {
        data[field.key] = Number(value);
      } else if (field.type === "BOOLEAN") {
        data[field.key] = value === true;
      } else if (field.type === "MEDIA") {
        const urls =
          typeof value === "string"
            ? value
                .split("\n")
                .map((url) => url.trim())
                .filter(Boolean)
            : Array.isArray(value)
              ? value
              : [];

        data[field.key] = urls;
      } else {
        data[field.key] = value;
      }
    }

    return JSON.stringify(data);
  }

  const inputClass =
    "mt-1.5 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#292923] shadow-sm outline-none transition placeholder:text-[#292923]/35 hover:border-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  const selectClass =
    "mt-1.5 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#292923] shadow-sm outline-none transition hover:border-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  const fieldsWithErrors = new Set(
    (serverState.fieldErrors ?? []).map((error) => error.field),
  );

  const filledFields = fields.filter((field) => {
    const value = values[field.key];

    return (
      value !== undefined &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    );
  }).length;

  const requiredFields = fields.filter((field) => field.isRequired).length;

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
                className="flex flex-wrap items-center gap-2 text-xs text-[#292923]/50"
              >
                <Link href="/" className="transition hover:text-[#292923]">
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
                <Link
                  href={`/datasets/${datasetId}`}
                  className="transition hover:text-[#292923]"
                >
                  Dataset details
                </Link>
                <span className="text-[#292923]/30">/</span>
                <span className="font-medium text-[#292923]/75">
                  New record
                </span>
              </nav>

              <h1 className="mt-1 text-lg font-semibold tracking-tight">
                Create record
              </h1>
            </div>
          </div>

          <Link
            href={`/datasets/${datasetId}`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-[#292923]/75 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
            Back to dataset
          </Link>
        </header>

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 pb-6 pt-7 sm:flex-row sm:items-end sm:pb-7 sm:pt-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Record management
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
              Add information to your dataset.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
              Fill in the fields below to create a structured record
              your AI agents can search and use.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]/60">
            <Database size={15} className="text-indigo-600" />
            <span>Dataset record</span>
          </div>
        </section>

        {/* Record overview */}
        <section
          aria-label="Record overview"
          className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <OverviewCard
            label="Total fields"
            value={fields.length.toLocaleString("en-IN")}
            description="Available record attributes"
            icon={<Database size={18} />}
            accent="indigo"
          />

          <OverviewCard
            label="Required fields"
            value={requiredFields.toLocaleString("en-IN")}
            description="Mandatory attributes"
            icon={<Info size={18} />}
            accent="amber"
          />

          <OverviewCard
            label="Completed fields"
            value={filledFields.toLocaleString("en-IN")}
            description="Fields filled in this record"
            icon={<Check size={18} />}
            accent="teal"
          />
        </section>

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="datasetId" value={datasetId} />
          <input type="hidden" name="data" value={serializeValues()} />

          {/* Record details */}
          <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                  <FilePlus2 size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Record details
                  </h3>
                  <p className="mt-0.5 text-xs text-[#292923]/55">
                    Fill in the information below to create a new record.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-[#292923]/65">
                <span className="size-1.5 rounded-full bg-indigo-500" />
                {fields.length} {fields.length === 1 ? "field" : "fields"}
              </span>
            </div>

            {fields.length === 0 ? (
              <div className="p-5 sm:p-7">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Info size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        No fields configured
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        This dataset has no fields. Add fields to its schema
                        before creating records.
                      </p>

                      <Link
                        href={`/datasets/${datasetId}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-950 underline underline-offset-4"
                      >
                        Return to dataset
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid w-full min-w-0 grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                {fields.map((field) => {
                  const value = values[field.key];

                  const options = Array.isArray(field.options)
                    ? field.options.filter(
                        (option): option is string =>
                          typeof option === "string",
                      )
                    : [];

                  const fieldErrors = serverState.fieldErrors?.filter(
                    (error) => error.field === field.key,
                  );

                  const hasError =
                    Boolean(clientError) && fieldsWithErrors.has(field.key);

                  const isFullWidth =
                    field.type === "MEDIA" || field.type === "MULTI_SELECT";

                  const fieldInputClass = `${inputClass} ${
                    hasError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
                  }`;

                  return (
                    <div
                      key={field.id}
                      className={`min-w-0 ${isFullWidth ? "sm:col-span-2 xl:col-span-3" : ""}`}
                    >
                      <label
                        htmlFor={field.key}
                        className="flex items-center gap-1.5 text-sm font-medium text-[#292923]/80"
                      >
                        {field.label}
                        {field.isRequired && (
                          <span
                            className="text-red-500"
                            aria-label="Required"
                          >
                            *
                          </span>
                        )}
                      </label>

                      {field.type === "TEXT" && (
                        <input
                          id={field.key}
                          name={`field-${field.key}`}
                          type="text"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className={fieldInputClass}
                          required={field.isRequired}
                          value={typeof value === "string" ? value : ""}
                          onChange={(event) =>
                            updateValue(field.key, event.target.value)
                          }
                          aria-invalid={hasError || undefined}
                        />
                      )}

                      {field.type === "NUMBER" && (
                        <input
                          id={field.key}
                          name={`field-${field.key}`}
                          type="number"
                          step="any"
                          placeholder="Enter a number"
                          className={fieldInputClass}
                          required={field.isRequired}
                          value={typeof value === "string" ? value : ""}
                          onChange={(event) =>
                            updateValue(field.key, event.target.value)
                          }
                          aria-invalid={hasError || undefined}
                        />
                      )}

                      {field.type === "DATE" && (
                        <input
                          id={field.key}
                          name={`field-${field.key}`}
                          type="date"
                          className={fieldInputClass}
                          required={field.isRequired}
                          value={typeof value === "string" ? value : ""}
                          onChange={(event) =>
                            updateValue(field.key, event.target.value)
                          }
                          aria-invalid={hasError || undefined}
                        />
                      )}

                      {field.type === "URL" && (
                        <input
                          id={field.key}
                          name={`field-${field.key}`}
                          type="url"
                          placeholder="https://example.com"
                          className={fieldInputClass}
                          required={field.isRequired}
                          value={typeof value === "string" ? value : ""}
                          onChange={(event) =>
                            updateValue(field.key, event.target.value)
                          }
                          aria-invalid={hasError || undefined}
                        />
                      )}

                      {field.type === "BOOLEAN" && (
                        <label className="mt-1.5 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-300 bg-slate-50/70 px-4 transition hover:border-slate-400 hover:bg-slate-50">
                          <input
                            id={field.key}
                            name={`field-${field.key}`}
                            type="checkbox"
                            checked={value === true}
                            onChange={(event) =>
                              updateValue(field.key, event.target.checked)
                            }
                            className="size-4 rounded border-slate-300 accent-indigo-600"
                          />
                          <span className="text-sm text-[#292923]/75">
                            Yes, enabled
                          </span>
                        </label>
                      )}

                      {field.type === "SINGLE_SELECT" && (
                        <div className="relative">
                          <select
                            id={field.key}
                            name={`field-${field.key}`}
                            className={`${fieldInputClass} appearance-none pr-9`}
                            required={field.isRequired}
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) =>
                              updateValue(field.key, event.target.value)
                            }
                            aria-invalid={hasError || undefined}
                          >
                            <option value="">Select an option</option>
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#292923]/40"
                          />
                        </div>
                      )}

                      {field.type === "MULTI_SELECT" && (
                        <div className="min-w-0">
                          <select
                            id={field.key}
                            name={`field-${field.key}`}
                            multiple
                            className={`${fieldInputClass} min-h-36`}
                            required={
                              field.isRequired &&
                              (!Array.isArray(value) || value.length === 0)
                            }
                            value={Array.isArray(value) ? value : []}
                            onChange={(event) =>
                              updateValue(
                                field.key,
                                Array.from(
                                  event.target.selectedOptions,
                                  (option) => option.value,
                                ),
                              )
                            }
                            aria-invalid={hasError || undefined}
                          >
                            {options.map((option) => (
                              <option
                                key={option}
                                value={option}
                                className="py-1"
                              >
                                {option}
                              </option>
                            ))}
                          </select>

                          <p className="mt-2 text-xs text-[#292923]/50">
                            Hold Ctrl on Windows or Cmd on Mac to select
                            multiple options.
                          </p>
                        </div>
                      )}

                      {field.type === "MEDIA" && (
                        <div className="min-w-0">
                          <textarea
                            id={field.key}
                            name={`field-${field.key}`}
                            placeholder={
                              "https://example.com/property-1.jpg\nhttps://example.com/property-2.jpg"
                            }
                            rows={4}
                            className={`${fieldInputClass} resize-y leading-6`}
                            required={field.isRequired}
                            value={
                              typeof value === "string"
                                ? value
                                : Array.isArray(value)
                                  ? value.join("\n")
                                  : ""
                            }
                            onChange={(event) =>
                              updateValue(field.key, event.target.value)
                            }
                            aria-invalid={hasError || undefined}
                          />

                          <p className="mt-2 text-xs leading-5 text-[#292923]/50">
                            Enter one publicly accessible HTTP or HTTPS image
                            URL per line.
                          </p>
                        </div>
                      )}

                      {fieldErrors?.map((error, index) => (
                        <p
                          key={`${field.key}-${index}`}
                          className="mt-2 text-xs text-red-600"
                        >
                          {error.message}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Form errors */}
          {(clientError || serverState.error) && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                !
              </span>
              <p className="text-sm leading-6 text-red-700">
                {clientError || serverState.error}
              </p>
            </div>
          )}

          {/* Submit area */}
          <div className="flex flex-col-reverse gap-4 rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#292923]/80">
                Ready to create your record?
              </p>
              <p className="mt-1 text-xs text-[#292923]/50">
                {filledFields} of {fields.length} fields completed
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/datasets/${datasetId}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#292923]/75 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isPending || fields.length === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving record...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Create record
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

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#292923] tabular-nums">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
        <span className={`size-1.5 rounded-full ${styles.marker}`} />
        <p className="text-xs text-[#292923]/55">{description}</p>
      </div>
    </div>
  );
}

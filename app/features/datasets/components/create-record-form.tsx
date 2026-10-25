"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
    "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

  const selectClass =
    "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

  const fieldsWithErrors = new Set(
    (serverState.fieldErrors ?? []).map((error) => error.field),
  );

  return (
    <div className="flex min-h-full w-full min-w-0 flex-col">
      <header className="flex w-full min-w-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <SidebarToggle />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link
              href={`/datasets/${datasetId}`}
              className="transition hover:text-slate-900"
            >
              Datasets
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-700">New record</span>
          </div>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Create record
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add information to your dataset.
          </p>
        </div>
      </header>

      <main className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="mx-0 w-full min-w-0 space-y-6"
        >
          <input type="hidden" name="datasetId" value={datasetId} />
          <input type="hidden" name="data" value={serializeValues()} />

          <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-950">
                  Record details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the information below to create a new record.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:self-center">
                <span className="size-1.5 rounded-full bg-slate-400" />
                {fields.length} {fields.length === 1 ? "field" : "fields"}
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="p-5 sm:p-7">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900">
                    No fields configured
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    This dataset has no fields. Add fields to its schema before
                    creating records.
                  </p>
                  <Link
                    href={`/datasets/${datasetId}`}
                    className="mt-3 inline-flex text-sm font-semibold text-amber-950 underline underline-offset-4"
                  >
                    Return to dataset
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid w-full min-w-0 grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
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

                  return (
                    <div
                      key={field.id}
                      className={`min-w-0 ${isFullWidth ? "sm:col-span-2 xl:col-span-3" : ""}`}
                    >
                      <label
                        htmlFor={field.key}
                        className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-800"
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
                          className={inputClass}
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
                          className={inputClass}
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
                          className={inputClass}
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
                          className={inputClass}
                          required={field.isRequired}
                          value={typeof value === "string" ? value : ""}
                          onChange={(event) =>
                            updateValue(field.key, event.target.value)
                          }
                          aria-invalid={hasError || undefined}
                        />
                      )}

                      {field.type === "BOOLEAN" && (
                        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition hover:bg-slate-50">
                          <input
                            id={field.key}
                            name={`field-${field.key}`}
                            type="checkbox"
                            checked={value === true}
                            onChange={(event) =>
                              updateValue(field.key, event.target.checked)
                            }
                            className="size-4 rounded border-slate-300 accent-slate-950"
                          />
                          <span className="text-sm text-slate-700">
                            Yes, enabled
                          </span>
                        </label>
                      )}

                      {field.type === "SINGLE_SELECT" && (
                        <select
                          id={field.key}
                          name={`field-${field.key}`}
                          className={selectClass}
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
                      )}

                      {field.type === "MULTI_SELECT" && (
                        <div className="min-w-0">
                          <select
                            id={field.key}
                            name={`field-${field.key}`}
                            multiple
                            className={`${selectClass} min-h-36`}
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
                          <p className="mt-2 text-xs text-slate-500">
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
                            className={`${inputClass} resize-y leading-6`}
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
                          <p className="mt-2 text-xs leading-5 text-slate-500">
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

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={`/datasets/${datasetId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isPending || fields.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isPending ? "Saving record..." : "Create record"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

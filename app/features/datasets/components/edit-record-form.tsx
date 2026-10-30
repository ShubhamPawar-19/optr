"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";

import {
  updateDatasetRecordAction,
  type UpdateRecordActionState,
} from "../actions";
import type { DatasetFieldSummary } from "../detail-types";

interface EditRecordFormProps {
  datasetId: string;
  recordId: string;
  fields: DatasetFieldSummary[];
  initialData: Record<string, unknown>;
}

type FieldValue = string | boolean | string[];

const initialState: UpdateRecordActionState = {};

export function EditRecordForm({
  datasetId,
  recordId,
  fields,
  initialData,
}: EditRecordFormProps) {
  const [serverState, formAction, isPending] = useActionState(
    updateDatasetRecordAction,
    initialState,
  );

  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {};

    for (const field of fields) {
      const value = initialData[field.key];

      if (field.type === "BOOLEAN") {
        initial[field.key] = value === true;
      } else if (
        field.type === "MULTI_SELECT" ||
        field.type === "MEDIA"
      ) {
        initial[field.key] = Array.isArray(value)
          ? value.filter(
              (item): item is string => typeof item === "string",
            )
          : field.type === "MEDIA" && typeof value === "string"
            ? value
            : [];
      } else if (value !== null && value !== undefined) {
        if (field.type === "DATE" && typeof value === "string") {
          initial[field.key] = value.slice(0, 10);
        } else if (
          field.type === "NUMBER" &&
          typeof value === "number"
        ) {
          initial[field.key] = String(value);
        } else if (typeof value === "string") {
          initial[field.key] = value;
        }
      }
    }

    return initial;
  });

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

      if (
        field.type === "NUMBER" &&
        value !== undefined &&
        value !== ""
      ) {
        if (
          typeof value !== "string" ||
          !Number.isFinite(Number(value))
        ) {
          event.preventDefault();
          setClientError(`"${field.label}" must be a valid number.`);
          return;
        }
      }

      if (field.type === "MEDIA") {
        const urls =
          typeof value === "string"
            ? value.split("\n").map((url) => url.trim()).filter(Boolean)
            : Array.isArray(value)
              ? value
              : [];

        const invalidUrl = urls.find((url) => {
          try {
            const parsed = new URL(url);
            return (
              parsed.protocol !== "https:" &&
              parsed.protocol !== "http:"
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
            ? value.split("\n").map((url) => url.trim()).filter(Boolean)
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
    "mt-2 w-full rounded-lg border border-slate-400 bg-white px-3.5 py-2.5 text-sm text-[#292923]-900 shadow-sm outline-none transition placeholder:text-[#292923]-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50";

  const fieldErrors = serverState.fieldErrors ?? [];

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="datasetId" value={datasetId} />
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="data" value={serializeValues()} />

      <div className="rounded-xl border border-slate-400 bg-white shadow-sm shadow-slate-950/[0.02]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold tracking-tight text-[#292923]-950">
            Record details
          </h2>
          <p className="mt-1 text-sm leading-5 text-[#292923]-500">
            Update the values below. Required fields are marked with an
            asterisk.
          </p>
        </div>

        {fields.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <p className="text-sm font-medium text-[#292923]-800">
              No fields defined
            </p>
            <p className="mt-1 text-sm text-[#292923]-500">
              Add fields to this dataset before editing its records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-5 sm:grid-cols-2 sm:p-6">
            {fields.map((field) => {
              const value = values[field.key];
              const options = Array.isArray(field.options)
                ? field.options.filter(
                    (option): option is string =>
                      typeof option === "string",
                  )
                : [];

              const errors = fieldErrors.filter(
                (error) => error.field === field.key,
              );

              const errorId = `${field.key}-error`;

              const commonProps = {
                id: field.key,
                required: field.isRequired,
                "aria-invalid": errors.length > 0 || undefined,
                "aria-describedby":
                  errors.length > 0 ? errorId : undefined,
                disabled: isPending,
              };

              return (
                <div
                  key={field.id}
                  className={
                    field.type === "MEDIA" ||
                    field.type === "MULTI_SELECT"
                      ? "min-w-0 sm:col-span-2"
                      : "min-w-0"
                  }
                >
                  {field.type !== "BOOLEAN" && (
                    <label
                      htmlFor={field.key}
                      className="block text-sm font-medium text-[#292923]-800"
                    >
                      {field.label}
                      {field.isRequired && (
                        <span
                          className="ml-1 text-red-600"
                          aria-hidden="true"
                        >
                          *
                        </span>
                      )}
                    </label>
                  )}

                  {field.type === "TEXT" && (
                    <input
                      {...commonProps}
                      type="text"
                      className={inputClass}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) =>
                        updateValue(field.key, event.target.value)
                      }
                    />
                  )}

                  {field.type === "NUMBER" && (
                    <input
                      {...commonProps}
                      type="number"
                      step="any"
                      className={inputClass}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) =>
                        updateValue(field.key, event.target.value)
                      }
                    />
                  )}

                  {field.type === "DATE" && (
                    <input
                      {...commonProps}
                      type="date"
                      className={inputClass}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) =>
                        updateValue(field.key, event.target.value)
                      }
                    />
                  )}

                  {field.type === "URL" && (
                    <input
                      {...commonProps}
                      type="url"
                      placeholder="https://example.com"
                      className={inputClass}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) =>
                        updateValue(field.key, event.target.value)
                      }
                    />
                  )}

                  {field.type === "BOOLEAN" && (
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-400 px-3.5 py-2.5 transition-colors hover:bg-[#292923]-50">
                      <input
                        type="checkbox"
                        checked={value === true}
                        disabled={isPending}
                        onChange={(event) =>
                          updateValue(field.key, event.target.checked)
                        }
                        className="size-4 rounded border-slate-300 accent-slate-900 focus:ring-2 focus:ring-slate-300"
                      />
                      <span className="text-sm font-medium text-[#292923]-700">
                        {field.label}
                        {field.isRequired && (
                          <span className="ml-1 text-red-600">*</span>
                        )}
                      </span>
                    </label>
                  )}

                  {field.type === "SINGLE_SELECT" && (
                    <select
                      {...commonProps}
                      className={inputClass}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) =>
                        updateValue(field.key, event.target.value)
                      }
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
                    <>
                      <select
                        {...commonProps}
                        multiple
                        className={`${inputClass} min-h-32`}
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
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs leading-5 text-[#292923]-500">
                        Hold Ctrl on Windows or Cmd on Mac to select
                        multiple options.
                      </p>
                    </>
                  )}

                  {field.type === "MEDIA" && (
                    <>
                      <textarea
                        {...commonProps}
                        rows={4}
                        placeholder={
                          "https://example.com/property-1.jpg\nhttps://example.com/property-2.jpg"
                        }
                        className={`${inputClass} resize-y font-mono text-xs leading-6`}
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
                      />
                      <p className="mt-2 text-xs leading-5 text-[#292923]-500">
                        Enter one publicly accessible HTTP or HTTPS image
                        URL per line.
                      </p>
                    </>
                  )}

                  {errors.length > 0 && (
                    <div id={errorId} className="mt-2 space-y-1">
                      {errors.map((error, index) => (
                        <p
                          key={`${field.key}-${index}`}
                          className="text-xs text-red-600"
                        >
                          {error.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(clientError || serverState.error) && (
          <div
            role="alert"
            aria-live="polite"
            className="mx-5 mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{clientError || serverState.error}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[#292923]-500">
            {fields.length} {fields.length === 1 ? "field" : "fields"}
            {" "}in this record
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/datasets/${datasetId}`}
              aria-disabled={isPending}
              className={`inline-flex items-center justify-center rounded-lg border border-slate-400 bg-white px-4 py-2.5 text-sm font-medium text-[#292923]-700 transition-colors hover:bg-[#292923]-50 ${
                isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isPending || fields.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#292923]-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
      } else if (field.type === "MULTI_SELECT") {
        initial[field.key] = Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
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

      if (field.type === "NUMBER" && value !== undefined && value !== "") {
        if (typeof value !== "string" || !Number.isFinite(Number(value))) {
          event.preventDefault();
          setClientError(`"${field.label}" must be a valid number.`);
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
      } else {
        data[field.key] = value;
      }
    }

    return JSON.stringify(data);
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <input type="hidden" name="datasetId" value={datasetId} />
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="data" value={serializeValues()} />

      <div className="space-y-5">
        {fields.map((field) => {
          const value = values[field.key];
          const options = Array.isArray(field.options)
            ? field.options.filter(
                (option): option is string => typeof option === "string",
              )
            : [];

          return (
            <div key={field.id}>
              <label
                htmlFor={field.key}
                className="block text-sm font-medium text-slate-800"
              >
                {field.label}
                {field.isRequired && (
                  <span className="ml-1 text-red-600">*</span>
                )}
              </label>

              {field.type === "TEXT" && (
                <input
                  id={field.key}
                  type="text"
                  className={inputClass}
                  required={field.isRequired}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) =>
                    updateValue(field.key, event.target.value)
                  }
                />
              )}

              {field.type === "NUMBER" && (
                <input
                  id={field.key}
                  type="number"
                  step="any"
                  className={inputClass}
                  required={field.isRequired}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) =>
                    updateValue(field.key, event.target.value)
                  }
                />
              )}

              {field.type === "DATE" && (
                <input
                  id={field.key}
                  type="date"
                  className={inputClass}
                  required={field.isRequired}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) =>
                    updateValue(field.key, event.target.value)
                  }
                />
              )}

              {field.type === "URL" && (
                <input
                  id={field.key}
                  type="url"
                  placeholder="https://example.com"
                  className={inputClass}
                  required={field.isRequired}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) =>
                    updateValue(field.key, event.target.value)
                  }
                />
              )}

              {field.type === "BOOLEAN" && (
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={value === true}
                    onChange={(event) =>
                      updateValue(field.key, event.target.checked)
                    }
                    className="size-4 rounded border-slate-300"
                  />
                  Yes
                </label>
              )}

              {field.type === "SINGLE_SELECT" && (
                <select
                  id={field.key}
                  className={inputClass}
                  required={field.isRequired}
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
                    id={field.key}
                    multiple
                    className={inputClass}
                    required={field.isRequired}
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
                  <p className="mt-1 text-xs text-slate-500">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple options.
                  </p>
                </>
              )}

              {field.type === "MEDIA" && (
                <input
                  id={field.key}
                  type="url"
                  placeholder="https://example.com/media"
                  className={inputClass}
                  required={field.isRequired}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) =>
                    updateValue(field.key, event.target.value)
                  }
                />
              )}

              {serverState.fieldErrors
                ?.filter((error) => error.field === field.key)
                .map((error, index) => (
                  <p
                    key={`${field.key}-${index}`}
                    className="mt-1 text-xs text-red-600"
                  >
                    {error.message}
                  </p>
                ))}
            </div>
          );
        })}
      </div>

      {(clientError || serverState.error) && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {clientError || serverState.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <Link
          href={`/datasets/${datasetId}`}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending || fields.length === 0}
          className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

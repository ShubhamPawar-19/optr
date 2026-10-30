
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Database,
  Info,
  Layers3,
  Plus,
  Trash2,
} from "lucide-react";
import { SidebarToggle } from "@/app/components/sidebar-toggle";
import {
  updateDatasetSchemaAction,
  type UpdateDatasetSchemaActionState,
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

export interface EditableDatasetField {
  id: string;
  label: string;
  key: string;
  type: FieldType;
  isRequired: boolean;
  isSearchable: boolean;
  options: string[];
}

interface FieldDraft extends EditableDatasetField {
  optionsText: string;
  isNew: boolean;
}

interface EditDatasetSchemaPageProps {
  datasetId: string;
  datasetName: string;
  initialFields: EditableDatasetField[];
}

const inputClass =
  "mt-2 h-10 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm text-[#292923]-900 outline-none transition placeholder:text-[#292923]-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

function toFieldKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function makeNewField(): FieldDraft {
  return {
    id: crypto.randomUUID(),
    label: "",
    key: "",
    type: "TEXT",
    isRequired: false,
    isSearchable: true,
    options: [],
    optionsText: "",
    isNew: true,
  };
}

function fieldTypeLabel(type: FieldType) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function EditDatasetSchemaPage({
  datasetId,
  datasetName,
  initialFields,
}: EditDatasetSchemaPageProps) {
  const [fields, setFields] = useState<FieldDraft[]>(() =>
    initialFields.map((field) => ({
      ...field,
      optionsText: field.options.join(", "),
      isNew: false,
    }))
  );

  const [error, setError] = useState("");
  const initialState: UpdateDatasetSchemaActionState = {};
  const [serverState, formAction, isPending] = useActionState(
    updateDatasetSchemaAction,
    initialState
  );

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
      ...(field.isNew ? { key: toFieldKey(label) } : {}),
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setError("");

    if (fields.length === 0) {
      event.preventDefault();
      setError("A dataset must have at least one field.");
      return;
    }

    if (fields.some((field) => !field.label.trim() || !field.key)) {
      event.preventDefault();
      setError("Every field needs a label and a valid field key.");
      return;
    }

    const keys = fields.map((field) => field.key);
    if (new Set(keys).size !== keys.length) {
      event.preventDefault();
      setError("Field keys must be unique. Check the field labels.");
      return;
    }

    const invalidOptions = fields.find((field) => {
      if (
        field.type !== "SINGLE_SELECT" &&
        field.type !== "MULTI_SELECT"
      ) {
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
      return;
    }

    const removedFields = initialFields.filter(
      (initialField) =>
        !fields.some((field) => field.id === initialField.id)
    );

    if (removedFields.length > 0) {
      const names = removedFields.map((field) => field.label).join(", ");
      const confirmed = window.confirm(
        `Remove ${names} from this dataset schema?\n\nTheir values will be permanently removed from every existing record. This cannot be undone.`
      );

      if (!confirmed) {
        event.preventDefault();
      }
    }
  }

  const serializedFields = fields.map((field) => ({
    ...(field.isNew ? {} : { id: field.id }),
    label: field.label.trim(),
    key: field.key,
    type: field.type,
    isRequired: field.isRequired,
    isSearchable: field.isSearchable,
    options:
      field.type === "SINGLE_SELECT" || field.type === "MULTI_SELECT"
        ? field.optionsText.split(",").map((option) => option.trim())
        : undefined,
  }));

  return (
    <main className="min-h-screen w-full bg-slate-50/80 text-[#292923]-950">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />
            <div className="h-5 w-px bg-slate-200" />
            <Link
              href={`/datasets/${datasetId}`}
              className="inline-flex items-center gap-2 text-sm text-[#292923]-500 transition hover:text-[#292923]-900"
            >
              <ArrowLeft className="size-4" />
              Back to dataset
            </Link>
          </div>

          <span className="hidden items-center gap-1.5 rounded-full border border-slate-400 bg-white px-3 py-1.5 text-xs font-medium text-[#292923]-500 sm:inline-flex">
            <Database className="size-3.5" />
            Schema editor
          </span>
        </div>

        <div className="mb-8 mt-8 flex items-start gap-4 sm:mb-10 sm:mt-10">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl border border-slate-400 bg-white shadow-sm sm:flex">
            <Layers3 className="size-5 text-[#292923]-700" />
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#292923]-500">
              Data management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#292923]-950 sm:text-3xl">
              Edit dataset schema
            </h1>
            <p className="mt-2 text-sm text-[#292923]-500 sm:text-[15px]">
              Update the fields used by agents in{" "}
              <span className="font-medium text-[#292923]-800">
                {datasetName}
              </span>
              .
            </p>
          </div>
        </div>

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="datasetId" value={datasetId} />
          <input
            type="hidden"
            name="fields"
            value={JSON.stringify(serializedFields)}
          />

          <section className="overflow-hidden rounded-2xl border border-slate-400 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Layers3 className="size-4 text-[#292923]-700" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#292923]-900">
                    Dataset fields
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#292923]-500">
                    Existing keys and field types are locked to protect stored data.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFields((current) => [...current, makeNewField()])
                }
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-[#292923]-700 transition hover:bg-[#292923]-50"
              >
                <Plus className="size-4" />
                Add field
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="overflow-hidden rounded-xl border border-slate-400 bg-white"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-400 bg-white text-xs font-semibold text-[#292923]-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#292923]-800">
                          {field.label.trim() || `Untitled field ${index + 1}`}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-[#292923]-400">
                          {field.key || "Key generated from label"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setFields((current) =>
                          current.filter((item) => item.id !== field.id)
                        )
                      }
                      aria-label={`Remove field ${index + 1}`}
                      title="Remove field"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#292923]-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                    <div>
                      <label
                        htmlFor={`label-${field.id}`}
                        className="text-xs font-medium text-[#292923]-700"
                      >
                        Field label *
                      </label>
                      <input
                        id={`label-${field.id}`}
                        value={field.label}
                        onChange={(event) =>
                          handleLabelChange(field, event.target.value)
                        }
                        maxLength={100}
                        required
                        placeholder="e.g. Property title"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`key-${field.id}`}
                        className="text-xs font-medium text-[#292923]-700"
                      >
                        Field key
                      </label>
                      <input
                        id={`key-${field.id}`}
                        value={field.key}
                        readOnly
                        className={`${inputClass} bg-slate-50 font-mono text-xs text-[#292923]-500`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`type-${field.id}`}
                        className="text-xs font-medium text-[#292923]-700"
                      >
                        Field type
                      </label>
                      <div className="relative">
                        <select
                          id={`type-${field.id}`}
                          value={field.type}
                          disabled={!field.isNew}
                          onChange={(event) =>
                            updateField(field.id, {
                              type: event.target.value as FieldType,
                            })
                          }
                          className={`${inputClass} appearance-none pr-9 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[#292923]-500`}
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {fieldTypeLabel(type)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#292923]-400" />
                      </div>
                    </div>

                    {(field.type === "SINGLE_SELECT" ||
                      field.type === "MULTI_SELECT") && (
                      <div>
                        <label
                          htmlFor={`options-${field.id}`}
                          className="text-xs font-medium text-[#292923]-700"
                        >
                          Options *
                        </label>
                        <input
                          id={`options-${field.id}`}
                          value={field.optionsText}
                          onChange={(event) =>
                            updateField(field.id, {
                              optionsText: event.target.value,
                            })
                          }
                          required
                          placeholder="Available, Pending, Sold"
                          className={inputClass}
                        />
                        <p className="mt-1.5 text-[11px] text-[#292923]-400">
                          Separate options with commas. Existing record values must remain included.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="flex items-center gap-1.5 text-[11px] text-[#292923]-500">
                      <Info className="size-3.5 shrink-0" />
                      Configure how this field is used.
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[#292923]-600">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(event) =>
                            updateField(field.id, {
                              isRequired: event.target.checked,
                            })
                          }
                          className="size-3.5 accent-slate-900"
                        />
                        Required
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[#292923]-600">
                        <input
                          type="checkbox"
                          checked={field.isSearchable}
                          onChange={(event) =>
                            updateField(field.id, {
                              isSearchable: event.target.checked,
                            })
                          }
                          className="size-3.5 accent-slate-900"
                        />
                        Searchable by agents
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setFields((current) => [...current, makeNewField()])
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-4 text-sm font-medium text-[#292923]-600 transition hover:bg-[#292923]-50 hover:text-[#292923]-900"
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

          <div className="flex flex-col-reverse gap-3 border-t border-slate-400 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#292923]-500">
              {fields.length} {fields.length === 1 ? "field" : "fields"} configured
            </p>
            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/datasets/${datasetId}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-4 text-sm font-medium text-[#292923]-700 transition hover:bg-[#292923]-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Save schema
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


"use client";

import { useState, useActionState, useEffect } from "react";
import {
  Plus,
  Pencil,
  X,
  Power,
  Save,
  SlidersHorizontal,
  Database,
  CheckCircle2,
  ArrowUpRight,
  CircleHelp,
  Layers3,
  Trash2,
  ListFilter,
} from "lucide-react";

import {
  createContactFieldAction,
  updateContactFieldAction,
  toggleContactFieldAction,
  type ContactFieldActionState,
  deleteContactFieldAction,
} from "../actions";
import { ContactFieldActions } from "./contact-field-actions";

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

type ContactField = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: FieldType;
  isRequired: boolean;
  isActive: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { values: number };
};

const initialState: ContactFieldActionState = {};

function formatFieldType(type: string) {
  return type.replaceAll("_", " ");
}

function SummaryMetric({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Database;
  accent: "indigo" | "teal" | "amber";
}) {
  const styles = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      marker: "bg-indigo-500",
      glow: "from-indigo-50/80",
    },
    teal: {
      icon: "bg-teal-50 text-teal-700 ring-teal-100",
      marker: "bg-teal-500",
      glow: "from-teal-50/80",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700 ring-amber-100",
      marker: "bg-amber-500",
      glow: "from-amber-50/80",
    },
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-400/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.055)] sm:p-6">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${styles.glow} to-transparent opacity-80`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#292923]-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#292923]-950 tabular-nums">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <span className={`size-1.5 rounded-full ${styles.marker}`} />
        <p className="text-xs text-[#292923]-500">{description}</p>
      </div>
    </div>
  );
}

export function ContactFieldsPage({
  fields,
}: {
  fields: ContactField[];
}) {
  const [showCreate, setShowCreate] = useState(false);

  const activeCount = fields.filter((field) => field.isActive).length;
  const storedValues = fields.reduce(
    (total, field) => total + field._count.values,
    0,
  );

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]-950">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-5 pb-7 pt-8 sm:flex-row sm:items-end sm:pt-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Contact configuration
            </div>

            <h1 className="text-[26px] font-semibold tracking-[-0.045em] text-[#292923]-950 sm:text-[32px]">
              Define the data you collect.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]-500 sm:text-[15px]">
              Configure the information OPTR tracks for every contact and makes
              available to your lead extraction pipeline.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]-500">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>{activeCount} active fields</span>
          </div>
        </section>

        {/* Overview metrics */}
        <section
          aria-label="Contact field overview"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryMetric
            label="Total fields"
            value={fields.length}
            description="All configured attributes"
            icon={Layers3}
            accent="indigo"
          />

          <SummaryMetric
            label="Active fields"
            value={activeCount}
            description="Available to the extraction pipeline"
            icon={CheckCircle2}
            accent="teal"
          />

          <SummaryMetric
            label="Stored values"
            value={storedValues}
            description="Values associated with contact fields"
            icon={Database}
            accent="amber"
          />
        </section>

        {/* Main configuration workspace */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-400/90 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)] sm:mt-9">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <SlidersHorizontal size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#292923]-950">
                  Contact fields
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#292923]-500">
                  Manage field definitions, types, and extraction requirements.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreate((value) => !value)}
              aria-expanded={showCreate}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium shadow-sm transition ${showCreate
                ? "border border-slate-400 bg-white text-[#292923]-700 hover:bg-[#292923]-50"
                : "bg-[#292923] text-white hover:bg-[#292923]-800"
                }`}
            >
              {showCreate ? <X size={16} /> : <Plus size={16} />}
              {showCreate ? "Cancel" : "Add field"}
            </button>
          </div>

          {/* Create field form */}
          {showCreate && (
            <div className="border-b border-indigo-100 bg-indigo-50/30 p-5 sm:p-6">
              <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600">
                    <Plus size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#292923]-900">
                      Create a contact field
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#292923]-500">
                      Choose what information your agents should capture.
                    </p>
                  </div>
                </div>

                <FieldForm
                  mode="create"
                  onCancel={() => setShowCreate(false)}
                />
              </div>
            </div>
          )}

          {/* Field list heading */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">
            <p className="text-xs text-[#292923]-500">
              <span className="font-semibold text-[#292923]-800">
                {fields.length.toLocaleString("en-IN")}
              </span>{" "}
              {fields.length === 1 ? "field" : "fields"} configured
            </p>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#292923]-500">
              <ListFilter size={14} className="text-[#292923]-400" />
              <span>Ordered by field position</span>
            </div>
          </div>

          {/* Field list */}
          <div className="space-y-3 p-4 sm:p-5">
            {fields.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-400 bg-slate-50/50 px-6 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-400 bg-white text-[#292923]-500 shadow-sm">
                  <Database size={23} strokeWidth={1.7} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#292923]-900">
                  Start with your first field
                </h3>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#292923]-500">
                  Define the information you want to capture from conversations,
                  such as budget, preferred location, or property type.
                </p>

                {!showCreate && (
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#292923] px-3.5 text-sm font-medium text-white transition hover:bg-[#292923]-800"
                  >
                    <Plus size={15} />
                    Create first field
                  </button>
                )}
              </div>
            ) : (
              fields.map((field) => (
                <FieldRow key={field.id} field={field} />
              ))
            )}
          </div>

          {/* Workspace footer */}
          <footer className="flex flex-wrap items-start gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <CircleHelp size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#292923]-700">
                About field definitions
              </p>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-[#292923]-500">
                Deactivating a field preserves existing values and history.
                Field keys remain stable so previously extracted data stays
                associated with the correct field.
              </p>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}

function FieldRow({ field }: { field: ContactField }) {

  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50/20">
        <div className="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50/50 px-4 py-3.5 sm:px-5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-indigo-100 bg-white text-indigo-600">
            <Pencil size={15} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#292923]-900">
              Edit field
            </h3>
            <p className="mt-0.5 text-xs text-[#292923]-500">
              Update the label, type, or extraction instructions.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <FieldForm
            mode="edit"
            field={field}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group rounded-xl border bg-white p-4 transition duration-200 sm:p-5 ${field.isActive
        ? "border-slate-400 hover:border-slate-300 hover:shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
        : "border-slate-400/80 bg-slate-50/60"
        }`}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-3.5">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${field.isActive
              ? "border-indigo-100 bg-indigo-50 text-indigo-600"
              : "border-slate-400 bg-white text-[#292923]-400"
              }`}
          >
            <Database size={18} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-sm font-semibold ${field.isActive ? "text-[#292923]-900" : "text-[#292923]-500"
                  }`}
              >
                {field.label}
              </h3>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${field.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-[#292923]-500"
                  }`}
              >
                <span
                  className={`size-1.5 rounded-full ${field.isActive ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                />
                {field.isActive ? "Active" : "Inactive"}
              </span>

              {field.isRequired && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  Required
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-[#292923]-500">
                {field.key}
              </code>
              <span className="text-[#292923]-300">·</span>
              <span className="text-xs text-[#292923]-500">
                {formatFieldType(field.type)}
              </span>
            </div>

            {field.description ? (
              <p className="mt-2.5 max-w-2xl text-sm leading-5 text-[#292923]-600">
                {field.description}
              </p>
            ) : (
              <p className="mt-2.5 text-xs text-[#292923]-400">
                No extraction description provided
              </p>
            )}

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-[#292923]-600">
                <Database size={12} className="text-[#292923]-400" />
                <span className="font-medium tabular-nums">
                  {field._count.values.toLocaleString("en-IN")}
                </span>
                stored {field._count.values === 1 ? "value" : "values"}
              </span>

              {field.isRequired && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50/50 px-2.5 py-1.5 text-xs text-amber-700">
                  Required for extraction
                </span>
              )}
            </div>
          </div>
        </div>
        <ContactFieldActions
          field={field}
          onEdit={() => setEditing(true)}
        />
      </div>
    </div>
  );
}

function FieldForm({
  mode,
  field,
  onCancel,
}: {
  mode: "create" | "edit";
  field?: ContactField;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [key, setKey] = useState(field?.key ?? "");
  const [description, setDescription] = useState(field?.description ?? "");
  const [type, setType] = useState<FieldType>(field?.type ?? "TEXT");
  const [isRequired, setIsRequired] = useState(field?.isRequired ?? false);
  const [keyTouched, setKeyTouched] = useState(mode === "edit");

  const action =
    mode === "create" ? createContactFieldAction : updateContactFieldAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (mode === "edit" && state.success) {
      onCancel();
    }
  }, [mode, state.success, onCancel]);

  function updateLabel(value: string) {
    setLabel(value);

    if (mode === "create" && !keyTouched) {
      setKey(
        value
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, ""),
      );
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && field && (
        <input type="hidden" name="id" value={field.id} />
      )}

      <input type="hidden" name="label" value={label} />
      <input type="hidden" name="key" value={key} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="isRequired" value={String(isRequired)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`field-label-${field?.id ?? "new"}`}
            className="text-xs font-semibold text-[#292923]-700"
          >
            Field label <span className="text-red-500">*</span>
          </label>

          <input
            id={`field-label-${field?.id ?? "new"}`}
            value={label}
            onChange={(event) => updateLabel(event.target.value)}
            maxLength={100}
            required
            placeholder="e.g. Preferred location"
            className="mt-2 h-10 w-full rounded-xl border border-slate-400 bg-white px-3 text-sm outline-none transition placeholder:text-[#292923]-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </div>

        <div>
          <label
            htmlFor={`field-key-${field?.id ?? "new"}`}
            className="text-xs font-semibold text-[#292923]-700"
          >
            Field key
          </label>

          <input
            id={`field-key-${field?.id ?? "new"}`}
            value={key}
            onChange={(event) => {
              setKeyTouched(true);
              setKey(
                event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, ""),
              );
            }}
            readOnly={mode === "edit"}
            maxLength={100}
            required
            className="mt-2 h-10 w-full rounded-xl border border-slate-400 bg-slate-50 px-3 font-mono text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 read-only:cursor-not-allowed read-only:text-[#292923]-500"
          />

          <p className="mt-1.5 text-[11px] leading-4 text-[#292923]-500">
            {mode === "edit"
              ? "Keys cannot be changed after creation."
              : "Lowercase letters, numbers, and underscores."}
          </p>
        </div>

        <div>
          <label
            htmlFor={`field-type-${field?.id ?? "new"}`}
            className="text-xs font-semibold text-[#292923]-700"
          >
            Field type
          </label>

          <select
            id={`field-type-${field?.id ?? "new"}`}
            value={type}
            onChange={(event) => setType(event.target.value as FieldType)}
            className="mt-2 h-10 w-full rounded-xl border border-slate-400 bg-white px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          >
            {FIELD_TYPES.map((fieldType) => (
              <option key={fieldType} value={fieldType}>
                {formatFieldType(fieldType)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`field-description-${field?.id ?? "new"}`}
            className="text-xs font-semibold text-[#292923]-700"
          >
            Description
          </label>

          <input
            id={`field-description-${field?.id ?? "new"}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            placeholder="What should the agent extract?"
            className="mt-2 h-10 w-full rounded-xl border border-slate-400 bg-white px-3 text-sm outline-none transition placeholder:text-[#292923]-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />

          <p className="mt-1.5 text-[11px] leading-4 text-[#292923]-500">
            Give your extraction pipeline clear context.
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-400 bg-white p-3.5 transition hover:border-slate-300">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(event) => setIsRequired(event.target.checked)}
          className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
        />

        <span>
          <span className="block text-xs font-semibold text-[#292923]-800">
            Required field
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#292923]-500">
            Mark this information as required for your lead qualification
            process.
          </span>
        </span>
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700"
        >
          {state.success}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-slate-400/80 pt-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#292923] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "create" ? <Plus size={15} /> : <Save size={15} />}
          {pending
            ? "Saving..."
            : mode === "create"
              ? "Create field"
              : "Save changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-400 bg-white px-4 text-sm font-medium text-[#292923]-600 transition hover:bg-[#292923]-50 hover:text-[#292923]-900"
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </form>
  );
}

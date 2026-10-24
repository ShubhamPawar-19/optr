
"use client";

import { useState, useActionState } from "react";
import { Plus, Pencil, Check, X, Power, Save } from "lucide-react";

import {
  createContactFieldAction,
  updateContactFieldAction,
  toggleContactFieldAction,
  type ContactFieldActionState,
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

export function ContactFieldsPage({
  fields,
}: {
  fields: ContactField[];
}) {
  const [showCreate, setShowCreate] = useState(false);

  const activeCount = fields.filter((field) => field.isActive).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total fields" value={fields.length} />
        <Summary label="Active fields" value={activeCount} />
        <Summary
          label="Stored values"
          value={fields.reduce((total, field) => total + field._count.values, 0)}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Your contact fields</h2>
            <p className="mt-1 text-sm text-slate-500">
              Active fields are available to the contact extraction pipeline.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            {showCreate ? "Cancel" : "Add field"}
          </button>
        </div>

        {showCreate && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <FieldForm
              mode="create"
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}

        <div className="mt-6 space-y-3">
          {fields.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No contact fields yet. Add one to start defining what OPTR tracks.
            </p>
          ) : (
            fields.map((field) => (
              <FieldRow key={field.id} field={field} />
            ))
          )}
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-400">
        Deactivating a field preserves existing values and history. Field keys
        remain stable so previously extracted data stays associated with the
        correct field.
      </p>
    </div>
  );
}

function FieldRow({ field }: { field: ContactField }) {
  const [editing, setEditing] = useState(false);
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleContactFieldAction,
    initialState,
  );

  if (editing) {
    return (
      <div className="rounded-lg border border-slate-200 p-4">
        <FieldForm
          mode="edit"
          field={field}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{field.label}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                field.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {field.isActive ? "Active" : "Inactive"}
            </span>
            {field.isRequired && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Required
              </span>
            )}
          </div>

          <p className="mt-1 break-all font-mono text-xs text-slate-500">
            {field.key}
          </p>

          {field.description && (
            <p className="mt-2 text-sm leading-5 text-slate-600">
              {field.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-1">
              {field.type.replaceAll("_", " ")}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1">
              {field._count.values} stored values
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <Pencil size={14} />
            Edit
          </button>

          <form action={toggleAction}>
            <input type="hidden" name="fieldId" value={field.id} />
            <input
              type="hidden"
              name="isActive"
              value={String(!field.isActive)}
            />
            <button
              type="submit"
              disabled={togglePending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Power size={14} />
              {togglePending
                ? "Saving..."
                : field.isActive
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </form>
        </div>
      </div>

      {toggleState.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {toggleState.error}
        </p>
      )}
      {toggleState.success && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {toggleState.success}
        </p>
      )}
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
    <form action={formAction} className="space-y-4">
      {mode === "edit" && field && (
        <input type="hidden" name="id" value={field.id} />
      )}

      <input type="hidden" name="label" value={label} />
      <input type="hidden" name="key" value={key} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="isRequired" value={String(isRequired)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Field label *</label>
          <input
            value={label}
            onChange={(event) => updateLabel(event.target.value)}
            maxLength={100}
            required
            placeholder="e.g. Preferred location"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Field key</label>
          <input
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
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm outline-none focus:border-slate-400"
          />
          <p className="mt-1 text-xs text-slate-500">
            {mode === "edit"
              ? "Keys cannot be changed after creation."
              : "Use lowercase letters, numbers, and underscores."}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Field type</label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as FieldType)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {FIELD_TYPES.map((fieldType) => (
              <option key={fieldType} value={fieldType}>
                {fieldType.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            placeholder="What should the agent extract?"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(event) => setIsRequired(event.target.checked)}
          className="rounded border-slate-300"
        />
        Required field
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

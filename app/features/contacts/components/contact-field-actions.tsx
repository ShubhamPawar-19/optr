
"use client";

import { useActionState, useState } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";

import {
    toggleContactFieldAction,
    deleteContactFieldAction,
    type ContactFieldActionState,
} from "../actions";

type ContactFieldActionItem = {
    id: string;
    label: string;
    isActive: boolean;
    _count: {
        values: number;
    };
};

const initialState: ContactFieldActionState = {};

export function ContactFieldActions({
    field,
    onEdit,
}: {
    field: ContactFieldActionItem;
    onEdit: () => void;
}) {
    const [toggleState, toggleAction, togglePending] = useActionState(
        toggleContactFieldAction,
        initialState,
    );

    const [deleteState, deleteAction, deletePending] = useActionState(
        deleteContactFieldAction,
        initialState,
    );

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <>
            <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-400 bg-white px-3 text-xs font-medium text-[#292923]-600 transition hover:border-slate-300 hover:bg-[#292923]-50 hover:text-[#292923]-900"
                >
                    <Pencil size={13} />
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
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${field.isActive
                            ? "border-slate-400 bg-white text-[#292923]-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50"
                            }`}
                    >
                        <Power size={13} />
                        {togglePending
                            ? "Saving..."
                            : field.isActive
                                ? "Deactivate"
                                : "Activate"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deletePending}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Trash2 size={13} />
                    Delete
                </button>
            </div>

            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#292923]/40 p-4 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !deletePending) {
                            setShowDeleteConfirm(false);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={`delete-title-${field.id}`}
                        aria-describedby={`delete-description-${field.id}`}
                        className="w-full max-w-md rounded-2xl border border-slate-400 bg-white p-6 shadow-2xl"
                    >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={20} />
                        </div>

                        <h2
                            id={`delete-title-${field.id}`}
                            className="mt-4 text-lg font-semibold tracking-tight text-[#292923]-950"
                        >
                            Delete contact field?
                        </h2>

                        <p
                            id={`delete-description-${field.id}`}
                            className="mt-2 text-sm leading-6 text-[#292923]-600"
                        >
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-[#292923]-900">
                                {field.label}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {field._count.values > 0 && (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs leading-5 text-amber-800">
                                    This field has{" "}
                                    {field._count.values.toLocaleString("en-IN")} stored{" "}
                                    {field._count.values === 1 ? "value" : "values"}. Deletion
                                    may be blocked to protect existing contact data. Consider
                                    deactivating the field instead.
                                </p>
                            </div>
                        )}

                        {deleteState.error && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700"
                            >
                                {deleteState.error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deletePending}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-400 bg-white px-4 text-sm font-medium text-[#292923]-700 transition hover:bg-[#292923]-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <form
                                action={async (formData) => {
                                    await deleteAction(formData);
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                <input type="hidden" name="fieldId" value={field.id} />

                                <button
                                    type="submit"
                                    disabled={deletePending || field._count.values > 0}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 size={14} />
                                    {deletePending ? "Deleting..." : "Delete field"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {toggleState.error && (
                <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                    {toggleState.error}
                </p>
            )}

            {toggleState.success && (
                <p
                    role="status"
                    className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
                >
                    {toggleState.success}
                </p>
            )}
        </>
    );
}

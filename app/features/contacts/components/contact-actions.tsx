
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import {
    updateContactAction,
    deleteContactAction,
    type ContactActionState,
} from "../contact-actions";

const initialState: ContactActionState = {};

type Props = {
    contactId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    phoneLocked: boolean;
    leadCount: number;
};

export function ContactActions({
    contactId,
    name,
    email,
    phone,
    phoneLocked,
    leadCount,
}: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [updateState, updateAction, updating] = useActionState(
        updateContactAction,
        initialState,
    );
    const [deleteState, deleteAction, deleting] = useActionState(
        deleteContactAction,
        initialState,
    );

    useEffect(() => {
        if (updateState.success) {
            setEditing(false);
            router.refresh();
        }
    }, [updateState.success, router]);

    useEffect(() => {
        if (deleteState.success) {
            router.replace("/contacts");
        }
    }, [deleteState.success, router]);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
                {editing ? <X size={16} /> : <Pencil size={16} />}
                {editing ? "Close editor" : "Edit contact"}
            </button>

            <form
                action={deleteAction}
                onSubmit={(event) => {
                    if (
                        !window.confirm(
                            "Delete this contact? Its conversations will be preserved, but its linked identities and profile data will be deleted.",
                        )
                    ) {
                        event.preventDefault();
                    }
                }}
            >
                <input type="hidden" name="contactId" value={contactId} />
                <button
                    type="submit"
                    disabled={deleting || leadCount > 0}
                    title={
                        leadCount > 0
                            ? "Delete or reassign associated leads first."
                            : "Delete contact"
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2 size={16} />
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </form>

            {editing && (
                <form
                    action={updateAction}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                >
                    <input type="hidden" name="contactId" value={contactId} />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Name
                            <input
                                name="name"
                                defaultValue={name ?? ""}
                                maxLength={150}
                                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                        </label>

                        <label className="block text-sm font-medium text-slate-700">
                            Email
                            <input
                                name="email"
                                type="email"
                                defaultValue={email ?? ""}
                                maxLength={254}
                                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                        </label>

                        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                            Phone number
                            <input
                                name="phone"
                                type="tel"
                                defaultValue={phone ?? ""}
                                maxLength={40}
                                readOnly={phoneLocked}
                                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none read-only:bg-slate-100 read-only:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                            {phoneLocked && (
                                <span className="mt-1 block text-xs font-normal text-amber-700">
                                    Locked because this contact has a linked WhatsApp or phone
                                    identity. Changing it requires updating the channel identity
                                    safely.
                                </span>
                            )}
                        </label>
                    </div>

                    {updateState.error && (
                        <p className="mt-3 text-sm text-red-600">{updateState.error}</p>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {updating ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            )}

            {deleteState.error && (
                <p className="w-full text-sm text-red-600">{deleteState.error}</p>
            )}
        </div>
    );
}

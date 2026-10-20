
"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteDatasetRecordAction,
  type DeleteRecordActionState,
} from "../actions";

interface DeleteRecordButtonProps {
  datasetId: string;
  recordId: string;
}

const initialState: DeleteRecordActionState = {};

export function DeleteRecordButton({
  datasetId,
  recordId,
}: DeleteRecordButtonProps) {
  const [serverState, formAction, isPending] = useActionState(
    deleteDatasetRecordAction,
    initialState,
  );

  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirmation(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        <Trash2 size={13} />
        Delete
      </button>

      {showConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              setShowConfirmation(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${recordId}`}
            aria-describedby={`delete-description-${recordId}`}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id={`delete-title-${recordId}`}
              className="text-lg font-semibold text-slate-950"
            >
              Delete this record?
            </h2>

            <p
              id={`delete-description-${recordId}`}
              className="mt-2 text-sm text-slate-600"
            >
              This action permanently deletes the record. You cannot undo it.
            </p>

            {serverState.error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {serverState.error}
              </p>
            )}

            <form action={formAction} className="mt-6">
              <input type="hidden" name="datasetId" value={datasetId} />
              <input type="hidden" name="recordId" value={recordId} />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowConfirmation(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Delete record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

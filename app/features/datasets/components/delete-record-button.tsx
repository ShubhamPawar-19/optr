"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2, AlertTriangle, LoaderCircle } from "lucide-react";

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

  useEffect(() => {
    if (!showConfirmation) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setShowConfirmation(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfirmation, isPending]);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirmation(true)}
        aria-label={`Delete record ${recordId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
      >
        <Trash2 size={13} />
        Delete
      </button>

      {showConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isPending
            ) {
              setShowConfirmation(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${recordId}`}
            aria-describedby={`delete-description-${recordId}`}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/15"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={21} />
              </div>

              <div className="min-w-0 pt-0.5">
                <h2
                  id={`delete-title-${recordId}`}
                  className="text-base font-semibold text-slate-950"
                >
                  Delete this record?
                </h2>

                <p
                  id={`delete-description-${recordId}`}
                  className="mt-2 text-sm leading-6 text-slate-500"
                >
                  This permanently deletes the record from this
                  dataset. This action cannot be undone.
                </p>
              </div>
            </div>

            {serverState.error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {serverState.error}
              </div>
            )}

            <form action={formAction} className="mt-6">
              <input
                type="hidden"
                name="datasetId"
                value={datasetId}
              />

              <input
                type="hidden"
                name="recordId"
                value={recordId}
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowConfirmation(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Delete record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
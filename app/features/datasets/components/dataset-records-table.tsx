import Link from "next/link";
import type { Prisma } from "@/app/generated/prisma/client";
import { FileText, Pencil } from "lucide-react";

import type {
  DatasetFieldSummary,
  DatasetRecordSummary,
} from "../detail-types";
import { DeleteRecordButton } from "./delete-record-button";

interface DatasetRecordsTableProps {
  datasetId: string;
  fields: DatasetFieldSummary[];
  records: DatasetRecordSummary[];
  totalRecords: number;
}

function getCellValue(
  data: Prisma.JsonValue,
  key: string,
): Prisma.JsonValue | undefined {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    return undefined;
  }

  return data[key];
}

function formatValue(
  value: Prisma.JsonValue | undefined,
): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function DatasetRecordsTable({
  datasetId,
  fields,
  records,
  totalRecords,
}: DatasetRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <FileText size={20} />
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-900">
          No records yet
        </p>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Add your first record to start populating this dataset.
        </p>

        <Link
          href={`/datasets/${datasetId}/records/new`}
          className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Add record
        </Link>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Records exist, but there are no schema fields to display.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              {fields.map((field) => (
                <th
                  key={field.id}
                  className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-600"
                >
                  {field.label}
                </th>
              ))}

              <th className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-600">
                Last updated
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr
                key={record.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                {fields.map((field) => {
                  const value = formatValue(
                    getCellValue(record.data, field.key),
                  );

                  return (
                    <td
                      key={field.id}
                      className="max-w-xs px-5 py-4 text-slate-700"
                    >
                      <span
                        className="block max-w-xs truncate"
                        title={value}
                      >
                        {value}
                      </span>
                    </td>
                  );
                })}

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                  {record.updatedAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/datasets/${datasetId}/records/${record.id}/edit`}
                      aria-label={`Edit record ${record.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <Pencil size={13} />
                      Edit
                    </Link>

                    <DeleteRecordButton
                      datasetId={datasetId}
                      recordId={record.id}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {records.length} of {totalRecords}{" "}
          {totalRecords === 1 ? "record" : "records"}
        </span>

        {totalRecords > records.length && (
          <span>
            Showing the 100 most recently updated records.
          </span>
        )}
      </div>
    </div>
  );
}
import type { Prisma } from "@/app/generated/prisma/client";
import {  FileText } from "lucide-react";

import type { DatasetFieldSummary, DatasetRecordSummary } from "../detail-types";

interface DatasetRecordsTableProps {
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

function formatValue(value: Prisma.JsonValue | undefined): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function DatasetRecordsTable({
  fields,
  records,
  totalRecords,
}: DatasetRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
        <FileText className="mx-auto text-slate-400" size={24} />
        <p className="mt-3 text-sm font-medium text-slate-700">
          No records yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Records added to this dataset will appear here.
        </p>
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              {fields.map((field) => (
                <th
                  key={field.id}
                  className="whitespace-nowrap px-5 py-3 font-medium"
                >
                  {field.label}
                </th>
              ))}
              <th className="whitespace-nowrap px-5 py-3 font-medium">
                Last updated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/70">
                {fields.map((field) => (
                  <td
                    key={field.id}
                    className="max-w-xs px-5 py-3.5 text-slate-700"
                  >
                    <span
                      className="block truncate"
                      title={formatValue(
                        getCellValue(record.data, field.key),
                      )}
                    >
                      {formatValue(getCellValue(record.data, field.key))}
                    </span>
                  </td>
                ))}

                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500">
                  {record.updatedAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {records.length} of {totalRecords} records
        </span>
        {totalRecords > records.length && (
          <span>Only the 100 most recently updated records are loaded.</span>
        )}
      </div>
    </div>
  );
}
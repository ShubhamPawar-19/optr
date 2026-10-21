import { Check, Minus, Search, ShieldCheck } from "lucide-react";

import type { DatasetFieldSummary } from "../detail-types";

interface DatasetFieldsTableProps {
  fields: DatasetFieldSummary[];
}

export function DatasetFieldsTable({
  fields,
}: DatasetFieldsTableProps) {
  if (fields.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          No fields defined
        </p>
        <p className="mt-1 text-sm text-slate-500">
          This dataset does not have a schema yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Field</th>
              <th className="px-5 py-3 font-medium">Key</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Required</th>
              <th className="px-5 py-3 font-medium">Searchable</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {fields.map((field) => (
              <tr key={field.id} className="hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">
                  {field.label}
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {field.key}
                  </code>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
                    {field.type.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  {field.isRequired ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                      <Check size={15} />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Minus size={15} />
                      No
                    </span>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  {field.isSearchable ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <Search size={14} />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <ShieldCheck size={14} />
                      Disabled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        {fields.length} {fields.length === 1 ? "field" : "fields"} defined
      </div>
    </div>
  );
}
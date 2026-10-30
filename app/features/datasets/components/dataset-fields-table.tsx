import {
  Check,
  Minus,
  Search,
  ShieldCheck,
} from "lucide-react";

import type { DatasetFieldSummary } from "../detail-types";

interface DatasetFieldsTableProps {
  fields: DatasetFieldSummary[];
}

export function DatasetFieldsTable({
  fields,
}: DatasetFieldsTableProps) {
  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-slate-100 text-[#292923]-500">
          <Search size={20} />
        </div>

        <p className="text-sm font-semibold text-[#292923]-900">
          No fields defined
        </p>

        <p className="mt-1 max-w-sm text-sm text-[#292923]-500">
          This dataset does not have a schema yet. Add fields to define
          the structure of your records.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-400 bg-white shadow-sm shadow-slate-950/[0.02]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-400 bg-slate-50/80">
            <tr>
              <th className="px-5 py-3.5 font-medium text-[#292923]-600">
                Field
              </th>
              <th className="px-5 py-3.5 font-medium text-[#292923]-600">
                Key
              </th>
              <th className="px-5 py-3.5 font-medium text-[#292923]-600">
                Type
              </th>
              <th className="px-5 py-3.5 font-medium text-[#292923]-600">
                Required
              </th>
              <th className="px-5 py-3.5 font-medium text-[#292923]-600">
                Searchable
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {fields.map((field) => (
              <tr
                key={field.id}
                className="transition-colors hover:bg-[#292923]-50/70"
              >
                <td className="px-5 py-4">
                  <span className="font-medium text-[#292923]-900">
                    {field.label}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <code className="inline-flex max-w-48 truncate rounded-md border border-slate-400 bg-slate-50 px-2 py-1 font-mono text-xs text-[#292923]-600">
                    {field.key}
                  </code>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-md border border-slate-400 bg-white px-2.5 py-1 text-xs font-medium text-[#292923]-600">
                    {field.type.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {field.isRequired ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <Check size={15} strokeWidth={2.5} />
                      Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#292923]-500">
                      <Minus size={15} />
                      Optional
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  {field.isSearchable ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292923]-700">
                      <Search size={14} />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#292923]-400">
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

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3">
        <p className="text-xs text-[#292923]-500">
          {fields.length} {fields.length === 1 ? "field" : "fields"} defined
        </p>

        <p className="text-xs text-[#292923]-400">
          Dataset schema
        </p>
      </div>
    </div>
  );
}
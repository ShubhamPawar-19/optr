"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  Search,
  Users,
  MessageCircle,
} from "lucide-react";

type LeadField = {
  id: string;
  key: string;
  label: string;
  type: string;
  position: number;
};

type LeadContact = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    conversations: number;
  };
  profileValues: {
    contactFieldId: string;
    value: string | null;
    source: string;
    updatedAt: Date;
  }[];
};

type LeadsPageProps = {
  contacts: LeadContact[];
  fields: LeadField[];
};

function displayValue(value: string | null | undefined, type: string) {
  if (value === null || value === undefined || value.trim() === "") {
    return <span className="text-slate-400">—</span>;
  }

  if (type === "BOOLEAN") {
    if (value.toLowerCase() === "true") {
      return (
        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Yes
        </span>
      );
    }

    if (value.toLowerCase() === "false") {
      return (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          No
        </span>
      );
    }
  }

  if (type === "URL") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        Open link
      </a>
    );
  }

  return <span className="text-slate-700">{value}</span>;
}

export function LeadsPage({ contacts, fields }: LeadsPageProps) {
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return contacts;

    return contacts.filter((contact) => {
      const contactDetails = [
        contact.name,
        contact.phone,
        contact.email,
      ];

      const fieldValues = contact.profileValues.map((item) => item.value);

      return [...contactDetails, ...fieldValues].some((value) =>
        value?.toLowerCase().includes(query),
      );
    });
  }, [contacts, search]);

  const totalConversations = contacts.reduce(
    (total, contact) => total + contact._count.conversations,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50/70 px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px] space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Workspace / Leads
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Leads
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore your contacts and the information your agents extract
              from conversations. Configure the fields that matter to your
              business.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/contacts/fields"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Configure fields
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Users className="h-4 w-4" />
              Contacts
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total leads"
            value={contacts.length}
            detail="Contacts in this workspace"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Conversations"
            value={totalConversations}
            detail="Across all contacts"
            icon={<MessageCircle className="h-5 w-5" />}
          />
          <StatCard
            label="Tracked fields"
            value={fields.length}
            detail="Active extraction fields"
            icon={<Filter className="h-5 w-5" />}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">All leads</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by contact details or any extracted field value.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads..."
                aria-label="Search leads"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-3 font-medium text-slate-900">
                {contacts.length === 0 ? "No leads yet" : "No matching leads"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {contacts.length === 0
                  ? "Contacts will appear here as people interact with your agents."
                  : "Try another search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50 px-5 py-4 font-medium">
                      Contact
                    </th>
                    <th className="px-5 py-4 font-medium">Phone / Email</th>
                    {fields.map((field) => (
                      <th
                        key={field.id}
                        className="whitespace-nowrap px-5 py-4 font-medium"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="px-5 py-4 font-medium">Conversations</th>
                    <th className="whitespace-nowrap px-5 py-4 font-medium">
                      Updated
                    </th>
                    <th className="px-5 py-4 font-medium" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => {
                    const valuesByField = new Map(
                      contact.profileValues.map((item) => [
                        item.contactFieldId,
                        item.value,
                      ]),
                    );

                    return (
                      <tr
                        key={contact.id}
                        className="transition hover:bg-indigo-50/40"
                      >
                        <td className="sticky left-0 z-10 bg-white px-5 py-4 hover:bg-indigo-50/40">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="group flex min-w-[180px] items-center gap-3"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                              {(contact.name || contact.phone || "?")
                                .trim()
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 group-hover:text-indigo-600">
                                {contact.name || "Unknown contact"}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {contact.id.slice(0, 12)}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="min-w-[190px] px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-slate-700">
                              {contact.phone || "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {contact.email || ""}
                            </p>
                          </div>
                        </td>

                        {fields.map((field) => (
                          <td key={field.id} className="min-w-[150px] px-5 py-4">
                            {displayValue(valuesByField.get(field.id), field.type)}
                          </td>
                        ))}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {contact._count.conversations}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(contact.updatedAt))}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/contacts/${contact.id}`}
                            aria-label={`Open ${contact.name || "contact"} profile`}
                            className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <footer className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredContacts.length} of {contacts.length} leads
            </span>
            <span>Sorted by recently updated</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

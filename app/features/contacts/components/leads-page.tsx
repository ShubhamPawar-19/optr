"use client";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Filter,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Target,
  User,
  X,
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function displayValue(value: string | null | undefined, type: string) {
  if (value == null || value.trim() === "") {
    return <span className="text-[#292923]-300">—</span>;
  }

  if (type === "BOOLEAN") {
    const yes = value.toLowerCase() === "true";
    const no = value.toLowerCase() === "false";

    if (yes || no) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            yes ? "text-emerald-700" : "text-[#292923]-500"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              yes ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
          {yes ? "Yes" : "No"}
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
        onClick={(event) => event.stopPropagation()}
        className="inline-flex items-center gap-1 font-medium text-indigo-600 transition hover:text-indigo-800 hover:underline hover:underline-offset-4"
      >
        Open link
        <ArrowUpRight size={12} />
      </a>
    );
  }

  return (
    <span
      className="block max-w-[240px] truncate text-[#292923]-700"
      title={value}
    >
      {value}
    </span>
  );
}

function SummaryMetric({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Target;
  accent: "indigo" | "teal" | "amber";
}) {
  const accents = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      marker: "bg-[#292923]",
      glow: "from-indigo-50/70",
    },
    teal: {
      icon: "bg-teal-50 text-teal-700 ring-teal-100",
      marker: "bg-teal-500",
      glow: "from-teal-50/70",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700 ring-amber-100",
      marker: "bg-amber-500",
      glow: "from-amber-50/70",
    },
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${accents.glow} to-transparent opacity-80`}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#292923]-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[#292923]-950 tabular-nums">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${accents.icon}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2 border-t border-slate-400 pt-3">
        <span className={`size-1.5 shrink-0 rounded-full ${accents.marker}`} />
        <p className="text-xs text-[#292923]-500">{description}</p>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function LeadsPage({ contacts, fields }: LeadsPageProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = contacts.filter((contact) => {
      if (!query) return true;

      const details = [
        contact.name,
        contact.phone,
        contact.email,
        ...contact.profileValues.map((item) => item.value),
      ];

      return details.some((value) => value?.toLowerCase().includes(query));
    });

    return [...result].sort((a, b) => {
      const difference =
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();

      return sortOrder === "recent" ? -difference : difference;
    });
  }, [contacts, search, sortOrder]);

  const totalConversations = contacts.reduce(
    (total, contact) => total + contact._count.conversations,
    0,
  );

  const leadsWithConversations = contacts.filter(
    (contact) => contact._count.conversations > 0,
  ).length;

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]-950">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Sticky workspace header */}
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#292923]-400">
                <span>Workspace</span>
                <span className="text-[#292923]-300">/</span>
                <span className="font-medium text-[#292923]-600">Leads</span>
              </div>

              <h1 className="mt-1 text-lg font-semibold tracking-tight text-[#292923]-950">
                Lead management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/contacts/fields"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-[#292923]-600 shadow-sm transition hover:bg-[#292923]-50 hover:text-[#292923]-900"
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Manage fields</span>
              <span className="sm:hidden">Fields</span>
            </Link>

            <Link
              href="/contacts"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#292923] px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#292923]-800"
            >
              <User size={15} />
              <span>Contacts</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 pb-5 pt-7 sm:flex-row sm:items-end sm:pb-6 sm:pt-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium bg-[#292923] shadow-sm">
              <span className="size-1.5 rounded-full bg-[#292923]" />
              Lead workspace
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.045em] text-[#292923]-950 sm:text-[32px]">
              Turn conversations into customers.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]-500 sm:text-[15px]">
              Manage your leads, review captured information, and keep track of
              every conversation in one place.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]-500">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Live workspace data</span>
          </div>
        </section>

        {/* Compact metric cards */}
        <section
          aria-label="Lead overview"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryMetric
            label="Total leads"
            value={contacts.length}
            description="Contacts in this workspace"
            icon={User}
            accent="indigo"
          />

          <SummaryMetric
            label="Conversations"
            value={totalConversations}
            description={`${leadsWithConversations.toLocaleString("en-IN")} ${
              leadsWithConversations === 1 ? "lead has" : "leads have"
            } conversations`}
            icon={MessageCircle}
            accent="teal"
          />

          <SummaryMetric
            label="Tracked fields"
            value={fields.length}
            description="Configured contact attributes"
            icon={SlidersHorizontal}
            accent="amber"
          />
        </section>

        {/* Lead data workspace */}
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm sm:mt-7">
          {/* Table title and actions */}
          <div className="flex flex-col gap-4 border-b border-slate-400 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Target size={17} />
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-[#292923]-950">
                  All leads
                </h3>
                <p className="mt-0.5 text-xs text-[#292923]-500">
                  Your contacts and their captured information
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative sm:w-[290px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#292923]-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search leads..."
                  aria-label="Search leads"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50/70 pl-9 pr-9 text-sm text-[#292923]-800 outline-none transition placeholder:text-[#292923]-400 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#292923]-400 transition hover:bg-[#292923]-100 hover:text-[#292923]-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSortOrder((current) =>
                    current === "recent" ? "oldest" : "recent",
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-[#292923]-600 transition hover:bg-[#292923]-50 hover:text-[#292923]-900"
                title="Change update-date sort order"
              >
                <ArrowDownUp size={15} className="text-[#292923]-400" />
                {sortOrder === "recent" ? "Most recent" : "Oldest first"}
              </button>
            </div>
          </div>

          {/* Result summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400 bg-slate-50/70 px-5 py-3 sm:px-6">
            <p className="text-xs text-[#292923]-500">
              Showing{" "}
              <span className="font-semibold text-[#292923]-800">
                {filteredContacts.length.toLocaleString("en-IN")}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#292923]-800">
                {contacts.length.toLocaleString("en-IN")}
              </span>{" "}
              leads
              {search && (
                <span className="text-[#292923]-400"> · Matching your search</span>
              )}
            </p>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#292923]-500">
              <CalendarClock size={14} className="text-[#292923]-400" />
              <span>
                Updated{" "}
                {sortOrder === "recent" ? "most recently first" : "oldest first"}
              </span>
            </div>
          </div>

          {/* Table / empty state */}
          {filteredContacts.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-[#292923]-500">
                {contacts.length === 0 ? (
                  <Target size={23} strokeWidth={1.7} />
                ) : (
                  <Search size={23} strokeWidth={1.7} />
                )}
              </div>

              <h4 className="mt-4 text-sm font-semibold text-[#292923]-900">
                {contacts.length === 0
                  ? "Your leads will appear here"
                  : "No matching leads"}
              </h4>

              <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#292923]-500">
                {contacts.length === 0
                  ? "When people interact with your agents, their contact details and captured information will show up here."
                  : "We couldn't find any leads matching that search. Try a different name, phone number, email, or field value."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-[#292923]-700 shadow-sm transition hover:bg-[#292923]-50"
                >
                  <X size={14} />
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] table-auto text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-400 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-[0.075em] text-[#292923]-500">
                    <th className="sticky left-0 z-20 min-w-[230px] border-r border-slate-400 bg-slate-50 px-5 py-3.5 sm:px-6">
                      Contact
                    </th>

                    <th className="min-w-[205px] px-5 py-3.5">
                      Contact details
                    </th>

                    {fields.map((field) => (
                      <th
                        key={field.id}
                        className="min-w-[155px] whitespace-nowrap px-5 py-3.5"
                      >
                        {field.label}
                      </th>
                    ))}

                    <th className="min-w-[145px] px-5 py-3.5">
                      Conversations
                    </th>

                    <th className="min-w-[140px] whitespace-nowrap px-5 py-3.5">
                      Last updated
                    </th>

                    <th className="w-12 px-3 py-3.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80">
                  {filteredContacts.map((contact) => {
                    const valuesByField = new Map(
                      contact.profileValues.map((item) => [
                        item.contactFieldId,
                        item.value,
                      ]),
                    );

                    const displayName =
                      contact.name?.trim() ||
                      contact.phone ||
                      "Unknown contact";

                    const initials =
                      displayName === "Unknown contact"
                        ? "?"
                        : getInitials(displayName);

                    return (
                      <tr
                        key={contact.id}
                        className="group transition-colors hover:bg-indigo-50/40"
                      >
                        <td className="sticky left-0 z-10 border-r border-slate-400 bg-white px-5 py-3.5 transition-colors group-hover:bg-[#F8F9FF] sm:px-6">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="flex min-w-[190px] items-center gap-3"
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-semibold bg-[#292923]">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#292923]-800 transition group-hover:bg-[#292923]">
                                {displayName}
                              </p>

                              <p className="mt-1 text-[11px] text-[#292923]-400">
                                ID {contact.id.slice(0, 8)}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="space-y-1.5">
                            <p className="whitespace-nowrap text-[13px] font-medium text-[#292923]-700">
                              {contact.phone || "—"}
                            </p>

                            {contact.email ? (
                              <p
                                className="max-w-[190px] truncate text-xs text-[#292923]-400"
                                title={contact.email}
                              >
                                {contact.email}
                              </p>
                            ) : (
                              <p className="text-xs text-[#292923]-300">No email</p>
                            )}
                          </div>
                        </td>

                        {fields.map((field) => (
                          <td key={field.id} className="px-5 py-3.5">
                            {displayValue(
                              valuesByField.get(field.id),
                              field.type,
                            )}
                          </td>
                        ))}

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                              contact._count.conversations > 0
                                ? "border-teal-200 bg-teal-50 text-teal-700"
                                : "border-slate-400 bg-slate-50 text-[#292923]-500"
                            }`}
                          >
                            <MessageCircle
                              size={14}
                              className={
                                contact._count.conversations > 0
                                  ? "text-teal-600"
                                  : "text-[#292923]-400"
                              }
                            />
                            <span className="tabular-nums">
                              {contact._count.conversations}
                            </span>
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className="text-[13px] text-[#292923]-600">
                            {formatDate(contact.updatedAt)}
                          </span>
                        </td>

                        <td className="px-3 py-3.5 text-right">
                          <Link
                            href={`/contacts/${contact.id}`}
                            aria-label={`Open ${displayName}`}
                            title="Open contact"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-[#292923]-400 transition hover:border-slate-300 hover:bg-white hover:text-indigo-600 hover:shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                          >
                            <ArrowUpRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Workspace footer */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-400 bg-white px-5 py-3.5 sm:px-6">
            <p className="text-xs text-[#292923]-400">
              {filteredContacts.length > 0 ? (
                <>
                  Displaying{" "}
                  <span className="font-semibold text-[#292923]-600">
                    {filteredContacts.length.toLocaleString("en-IN")}
                  </span>{" "}
                  {filteredContacts.length === 1 ? "contact" : "contacts"}
                </>
              ) : (
                "No contacts to display"
              )}
            </p>

            <Link
              href="/contacts/fields"
              className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-[#292923]-500 transition hover:bg-[#292923]"
            >
              <Filter size={13} />
              Customize fields
              <ArrowUpRight size={12} />
            </Link>
          </footer>
        </section>

        {/* Bottom helper */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#292923]-400">
          <p>
            Lead information is organized using your configured contact fields.
          </p>
          <Link
            href="/contacts/fields"
            className="font-medium text-[#292923]-500 transition hover:text-indigo-600"
          >
            Configure your data <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
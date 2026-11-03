
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  MessageCircle,
  Mail,
  Phone,
  ArrowUpRight,
  X,
  ContactRound,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";

type Contact = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    conversations: number;
  };
};

type ContactsPageProps = {
  contacts: Contact[];
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ContactsPage({ contacts }: ContactsPageProps) {
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.phone, contact.email].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [contacts, search]);

  return (
    <main className="min-h-screen w-full min-w-0 bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Workspace header */}
        <header className="mb-8 flex min-w-0 items-center gap-3 border-b border-slate-200 pb-5">
          <SidebarToggle />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                href="/"
                className="transition hover:text-[#292923]"
              >
                Workspace
              </Link>

              <span>/</span>

              <span className="text-[#292923]">Contacts</span>
            </div>

            <div className="flex items-center gap-2">
              <ContactRound
                size={17}
                className="shrink-0 text-slate-500"
              />

              <p className="truncate text-sm font-semibold">
                Contact directory
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:inline-flex">
            <Users size={15} className="text-indigo-600" />

            <span className="text-sm font-semibold tabular-nums">
              {contacts.length.toLocaleString("en-IN")}
            </span>

            <span className="text-xs text-slate-500">
              {contacts.length === 1 ? "contact" : "contacts"}
            </span>
          </div>
        </header>

        {/* Page introduction */}
        <section className="mb-8">
          <div className="mb-3">
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Workspace management
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Contacts
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Find people, review their details, and open their
                conversation history.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Users size={17} className="text-indigo-600" />

              <span className="text-lg font-semibold tabular-nums">
                {contacts.length.toLocaleString("en-IN")}
              </span>

              <span className="text-sm text-slate-500">
                {contacts.length === 1 ? "contact" : "contacts"}
              </span>
            </div>
          </div>
        </section>

        {/* Contact directory */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Directory heading and search */}
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Contact directory
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Find people by name, phone number, or email address.
                </p>
              </div>
            </div>

            <div className="relative w-full lg:max-w-[340px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search contacts..."
                aria-label="Search contacts"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-sm text-[#292923] outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Result summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-6">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-[#292923]">
                {filteredContacts.length.toLocaleString("en-IN")}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#292923]">
                {contacts.length.toLocaleString("en-IN")}
              </span>{" "}
              contacts
              {search && (
                <span className="text-slate-400">
                  {" "}· Matching your search
                </span>
              )}
            </p>

            <span className="text-xs text-slate-500">
              Sorted by recently updated
            </span>
          </div>

          {/* Empty state */}
          {filteredContacts.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                {contacts.length === 0 ? (
                  <Users size={23} strokeWidth={1.7} />
                ) : (
                  <Search size={23} strokeWidth={1.7} />
                )}
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#292923]">
                {contacts.length === 0
                  ? "Your contacts will appear here"
                  : "No matching contacts"}
              </h3>

              <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                {contacts.length === 0
                  ? "Contacts appear here when incoming conversations are linked to people in your workspace."
                  : "Try another name, phone number, or email address to find the contact you're looking for."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <X size={14} />
                  Clear search
                </button>
              )}
            </div>
          ) : (
            /* Contacts table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold uppercase tracking-[0.075em] text-slate-400">
                    <th className="min-w-[250px] px-5 py-3.5 sm:px-6">
                      Contact
                    </th>

                    <th className="min-w-[250px] px-5 py-3.5">
                      Contact details
                    </th>

                    <th className="min-w-[150px] px-5 py-3.5">
                      Conversations
                    </th>

                    <th className="min-w-[145px] whitespace-nowrap px-5 py-3.5">
                      Last updated
                    </th>

                    <th className="w-12 px-3 py-3.5">
                      <span className="sr-only">Open contact</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => {
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
                        className="group transition-colors hover:bg-indigo-50/30"
                      >
                        {/* Contact identity */}
                        <td className="px-5 py-3.5 sm:px-6">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="flex min-w-[210px] items-center gap-3"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-xs font-semibold text-indigo-700">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#292923] transition group-hover:text-indigo-700">
                                {displayName}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                ID {contact.id.slice(0, 8)}
                              </p>
                            </div>
                          </Link>
                        </td>

                        {/* Contact details */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-2">
                            {contact.phone ? (
                              <p className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-slate-700">
                                <Phone
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />
                                {contact.phone}
                              </p>
                            ) : null}

                            {contact.email ? (
                              <p
                                className="flex max-w-[230px] items-center gap-2 truncate text-xs text-slate-500"
                                title={contact.email}
                              >
                                <Mail
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />

                                <span className="truncate">
                                  {contact.email}
                                </span>
                              </p>
                            ) : null}

                            {!contact.phone && !contact.email ? (
                              <span className="text-xs text-slate-400">
                                No contact details
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Conversation count */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                              contact._count.conversations > 0
                                ? "bg-teal-50 text-teal-700"
                                : "bg-slate-50 text-slate-500"
                            }`}
                          >
                            <MessageCircle
                              size={14}
                              className={
                                contact._count.conversations > 0
                                  ? "text-teal-600"
                                  : "text-slate-400"
                              }
                            />

                            <span className="tabular-nums">
                              {contact._count.conversations}
                            </span>
                          </span>
                        </td>

                        {/* Last updated */}
                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-600">
                          {formatDate(contact.updatedAt)}
                        </td>

                        {/* Open profile */}
                        <td className="px-3 py-3.5 text-right">
                          <Link
                            href={`/contacts/${contact.id}`}
                            aria-label={`Open profile for ${displayName}`}
                            title="Open contact"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
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

          {/* Directory footer */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3.5 sm:px-6">
            <p className="text-xs text-slate-400">
              Displaying{" "}
              <span className="font-semibold text-slate-600">
                {filteredContacts.length.toLocaleString("en-IN")}
              </span>{" "}
              {filteredContacts.length === 1 ? "contact" : "contacts"}
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <ContactRound size={13} />
              OPTR contact directory
            </span>
          </footer>
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-400">
            OPTR · Contact management
          </p>
        </footer>
      </div>
    </main>
  );
}

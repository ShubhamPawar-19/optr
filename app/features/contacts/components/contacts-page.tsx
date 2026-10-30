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
        value?.toLowerCase().includes(query),
      ),
    );
  }, [contacts, search]);

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]-950">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Compact page toolbar */}
        <div className="flex items-center gap-3 pt-5 sm:pt-6">
          <SidebarToggle />

          <div className="h-5 w-px bg-slate-200" />

          <span className="text-xs font-medium text-[#292923]-400">
            Workspace
          </span>

          <span className="text-xs text-[#292923]-300">/</span>

          <span className="text-xs font-medium text-[#292923]-700">
            Contacts
          </span>
        </div>

        {/* Compact page heading */}
        <section className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-7">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#292923]-950 sm:text-[28px]">
              Contacts
            </h1>

            <p className="mt-1.5 text-sm text-[#292923]-500">
              Find people, review their details, and open their conversation
              history.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-400 bg-white px-3.5 py-2.5 sm:self-auto">
            <Users size={17} className="text-indigo-600" />

            <span className="text-lg font-semibold tabular-nums text-[#292923]-950">
              {contacts.length.toLocaleString("en-IN")}
            </span>

            <span className="text-sm text-[#292923]-500">
              {contacts.length === 1 ? "contact" : "contacts"}
            </span>
          </div>
        </section>

        {/* Contact directory */}
        <section className="mt-0 overflow-hidden rounded-2xl border border-slate-400/90 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)]">
          {/* Directory heading and search */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#292923]-950">
                  Contact directory
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#292923]-500">
                  Find people by name, phone number, or email address.
                </p>
              </div>
            </div>

            <div className="relative w-full lg:max-w-[320px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#292923]-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search contacts..."
                aria-label="Search contacts"
                className="h-10 w-full rounded-xl border border-slate-400 bg-slate-50/70 pl-9 pr-9 text-sm text-[#292923]-800 outline-none transition placeholder:text-[#292923]-400 hover:border-slate-300 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
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
          </div>

          {/* Result summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-6">
            <p className="text-xs text-[#292923]-500">
              Showing{" "}
              <span className="font-semibold text-[#292923]-800">
                {filteredContacts.length.toLocaleString("en-IN")}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#292923]-800">
                {contacts.length.toLocaleString("en-IN")}
              </span>{" "}
              contacts
              {search && (
                <span className="text-[#292923]-400">
                  {" "}· Matching your search
                </span>
              )}
            </p>

            <span className="text-xs text-[#292923]-500">
              Sorted by recently updated
            </span>
          </div>

          {/* Empty state */}
          {filteredContacts.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-400 bg-slate-50 text-[#292923]-500">
                {contacts.length === 0 ? (
                  <Users size={23} strokeWidth={1.7} />
                ) : (
                  <Search size={23} strokeWidth={1.7} />
                )}
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#292923]-900">
                {contacts.length === 0
                  ? "Your contacts will appear here"
                  : "No matching contacts"}
              </h3>

              <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#292923]-500">
                {contacts.length === 0
                  ? "Contacts appear here when incoming conversations are linked to people in your workspace."
                  : "Try another name, phone number, or email address to find the contact you're looking for."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-[#292923]-700 shadow-sm transition hover:bg-[#292923]-50"
                >
                  <X size={14} />
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold uppercase tracking-[0.075em] text-[#292923]-400">
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
                        <td className="px-5 py-3.5 sm:px-6">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="flex min-w-[210px] items-center gap-3"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-xs font-semibold text-indigo-700">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#292923]-800 transition group-hover:text-indigo-700">
                                {displayName}
                              </p>

                              <p className="mt-1 text-[11px] text-[#292923]-400">
                                ID {contact.id.slice(0, 8)}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="space-y-2">
                            {contact.phone ? (
                              <p className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-[#292923]-700">
                                <Phone
                                  size={14}
                                  className="shrink-0 text-[#292923]-400"
                                />
                                {contact.phone}
                              </p>
                            ) : null}

                            {contact.email ? (
                              <p
                                className="flex max-w-[230px] items-center gap-2 truncate text-xs text-[#292923]-500"
                                title={contact.email}
                              >
                                <Mail
                                  size={14}
                                  className="shrink-0 text-[#292923]-400"
                                />
                                <span className="truncate">
                                  {contact.email}
                                </span>
                              </p>
                            ) : null}

                            {!contact.phone && !contact.email ? (
                              <span className="text-xs text-[#292923]-400">
                                No contact details
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                              contact._count.conversations > 0
                                ? "bg-teal-50 text-teal-700"
                                : "bg-slate-50 text-[#292923]-500"
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

                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-[#292923]-600">
                          {formatDate(contact.updatedAt)}
                        </td>

                        <td className="px-3 py-3.5 text-right">
                          <Link
                            href={`/contacts/${contact.id}`}
                            aria-label={`Open profile for ${displayName}`}
                            title="Open contact"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-[#292923]-400 transition hover:border-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
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
            <p className="text-xs text-[#292923]-400">
              Displaying{" "}
              <span className="font-semibold text-[#292923]-600">
                {filteredContacts.length.toLocaleString("en-IN")}
              </span>{" "}
              {filteredContacts.length === 1 ? "contact" : "contacts"}
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs text-[#292923]-400">
              <ContactRound size={13} />
              OPTR contact directory
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
"use client";

import { useMemo, useState } from "react";
import { Search, Users, MessageCircle, Mail, Phone, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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

export function ContactsPage({ contacts }: ContactsPageProps) {
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.phone, contact.email]
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [contacts, search]);

  const totalConversations = contacts.reduce(
    (total, contact) => total + contact._count.conversations,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50/70 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">Workspace / Contacts</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Contacts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              A unified directory of people interacting with your agents across channels.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm">
            <Users className="h-4 w-4" />
            Contact directory
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total contacts"
            value={contacts.length}
            detail="People in this workspace"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Linked conversations"
            value={totalConversations}
            detail="Across listed contacts"
            icon={<MessageCircle className="h-5 w-5" />}
          />
          <StatCard
            label="With contact details"
            value={contacts.filter((contact) => contact.phone || contact.email).length}
            detail="Phone or email available"
            icon={<Phone className="h-5 w-5" />}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">All contacts</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search people by name, phone number, or email.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search contacts..."
                aria-label="Search contacts"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-medium text-slate-900">
                {contacts.length === 0 ? "No contacts yet" : "No matching contacts"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {contacts.length === 0
                  ? "Contacts will appear here when an incoming WhatsApp conversation is linked to a person."
                  : "Try another name, phone number, or email address."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Contact details</th>
                    <th className="px-6 py-4 font-medium">Conversations</th>
                    <th className="px-6 py-4 font-medium">Last updated</th>
                    <th className="px-6 py-4 font-medium">
                      <span className="sr-only">Contact ID</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="cursor-pointer transition hover:bg-indigo-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                            {(contact.name || contact.phone || "?")
                              .trim()
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="font-medium text-slate-900 transition hover:text-indigo-600"
                            >
                              {contact.name || "Unknown contact"}
                            </Link>
                            <p className="mt-1 text-xs text-slate-400">
                              ID: {contact.id.slice(0, 12)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {contact.phone ? (
                            <p className="flex items-center gap-2 text-slate-600">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {contact.phone}
                            </p>
                          ) : null}
                          {contact.email ? (
                            <p className="flex items-center gap-2 text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {contact.email}
                            </p>
                          ) : null}
                          {!contact.phone && !contact.email ? (
                            <span className="text-slate-400">No details added</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {contact._count.conversations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(contact.updatedAt))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/contacts/${contact.id}`}
                          aria-label={`Open profile for ${contact.name || contact.phone || "contact"}`}
                          className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            <span>
              Showing {filteredContacts.length} of {contacts.length} contacts
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
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">{icon}</div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
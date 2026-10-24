
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MessageCircle } from "lucide-react";

import { getContactProfile } from "@/app/features/contacts/queries/get-contact-profile";

export const dynamic = "force-dynamic";

type ContactProfilePageProps = {
  params: Promise<{ contactId: string }>;
};

export default async function ContactProfilePage({
  params,
}: ContactProfilePageProps) {
  const { contactId } = await params;
  const contact = await getContactProfile(contactId);

  if (!contact) {
    notFound();
  }

  const conversationCount = contact.conversations.length;

  return (
    <main className="min-h-screen bg-slate-50/70 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to contacts
        </Link>

        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-semibold text-indigo-700">
                {(contact.name || contact.phone || "?")
                  .trim()
                  .slice(0, 1)
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Workspace / Contacts / Profile
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {contact.name || "Unknown contact"}
                </h1>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  {contact.phone && (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {contact.phone}
                    </span>
                  )}

                  {contact.email && (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <MessageCircle className="h-4 w-4" />
              {conversationCount}{" "}
              {conversationCount === 1 ? "conversation" : "conversations"}
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <ProfileStat
              label="Contact ID"
              value={contact.id}
            />
            <ProfileStat
              label="Channels"
              value={
                contact.identities.length
                  ? [...new Set(contact.identities.map((item) => item.channel))].join(", ")
                  : "No linked channels"
              }
            />
            <ProfileStat
              label="Created"
              value={new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(contact.createdAt)}
            />
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">Contact profile fields</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configured fields and facts collected about this contact.
            </p>
          </div>

          {contact.business.contactFields.length === 0 ? (
            <EmptyState message="No contact fields configured yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {contact.business.contactFields.map((field) => {
                const profileValue = contact.profileValues.find(
                  (item) => item.field.id === field.id,
                );

                return (
                  <div
                    key={field.id}
                    className="grid gap-2 px-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)]"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {field.label}
                      </p>
                      {field.description && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {field.description}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-sm text-slate-800">
                        {profileValue?.value || (
                          <span className="text-slate-400">Not provided yet</span>
                        )}
                      </p>

                      {profileValue && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-slate-500">
                            Source: {profileValue.source}
                            {" · "}
                            Updated{" "}
                            {new Intl.DateTimeFormat("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(profileValue.updatedAt)}
                          </p>

                          {profileValue.evidence && (
                            <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                              <span className="font-medium text-slate-700">
                                Evidence:{" "}
                              </span>
                              {profileValue.evidence}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">Conversation history</h2>
            <p className="mt-1 text-sm text-slate-500">
              Recent conversations and their latest messages.
            </p>
          </div>

          {contact.conversations.length === 0 ? (
            <EmptyState message="No conversations are linked to this contact yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {contact.conversations.map((conversation) => (
                <article key={conversation.id} className="px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">
                        {conversation.channel}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {conversation.externalId}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      Updated{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(conversation.updatedAt)}
                    </p>
                  </div>

                  {conversation.messages.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-400">
                      No messages available.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {conversation.messages
                        .slice()
                        .reverse()
                        .map((message) => (
                          <div
                            key={message.id}
                            className="rounded-xl bg-slate-50 p-3"
                          >
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <span className="text-xs font-medium uppercase text-slate-500">
                                {message.role}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Intl.DateTimeFormat("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(message.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                              {message.content}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

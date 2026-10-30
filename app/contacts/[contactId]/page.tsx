
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ContactRound,
  Hash,
  Mail,
  MessageCircle,
  Phone,
  Radio,
  Sparkles,
} from "lucide-react";

import { getContactProfile } from "@/app/features/contacts/queries/get-contact-profile";
import { SidebarToggle } from "@/app/components/sidebar-toggle";

export const dynamic = "force-dynamic";

type ContactProfilePageProps = {
  params: Promise<{ contactId: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const messageTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ContactProfilePage({
  params,
}: ContactProfilePageProps) {
  const { contactId } = await params;
  const contact = await getContactProfile(contactId);

  if (!contact) {
    notFound();
  }

  const conversationCount = contact.conversations.length;
  const populatedFields = contact.profileValues.filter(
    (item) => typeof item.value === "string" && item.value.trim().length > 0,
  ).length;

  const channels = [
    ...new Set(contact.identities.map((item) => item.channel)),
  ];

  const initials = (contact.name || contact.phone || "?")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page toolbar */}
        <div className="flex items-center gap-3">
          <SidebarToggle />

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#292923]-400">
            <span>Workspace</span>
            <span>/</span>
            <Link
              href="/contacts"
              className="transition hover:text-indigo-600"
            >
              Contacts
            </Link>
            <span>/</span>
            <span className="text-[#292923]-600">Profile</span>
          </div>
        </div>

        {/* Profile header */}
        <section className="overflow-hidden rounded-2xl border border-slate-400/80 bg-white shadow-sm shadow-slate-200/40">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400" />

          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl font-bold text-indigo-700 ring-4 ring-indigo-50 sm:h-20 sm:w-20 sm:text-3xl">
                  {initials}
                  <span
                    className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500"
                    title="Contact record exists"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      <ContactRound className="h-3.5 w-3.5" />
                      Contact profile
                    </span>

                    {channels.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        <Radio className="h-3.5 w-3.5" />
                        {channels.length} linked{" "}
                        {channels.length === 1 ? "channel" : "channels"}
                      </span>
                    )}
                  </div>

                  <h1 className="break-words text-2xl font-bold tracking-tight text-[#292923]-950 sm:text-3xl">
                    {contact.name || "Unknown contact"}
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#292923]-500">
                    Contact details, collected information, and the full
                    conversation history for this record.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-[#292923]-600 transition hover:text-indigo-700"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                          <Phone className="h-4 w-4" />
                        </span>
                        <span className="break-all">{contact.phone}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-sm text-[#292923]-400">
                        <Phone className="h-4 w-4" />
                        No phone number
                      </span>
                    )}

                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-[#292923]-600 transition hover:text-indigo-700"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                          <Mail className="h-4 w-4" />
                        </span>
                        <span className="break-all">{contact.email}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-sm text-[#292923]-400">
                        <Mail className="h-4 w-4" />
                        No email address
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 xl:min-w-48">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-[#292923]-950">
                    {conversationCount}
                  </p>
                  <p className="text-xs font-medium text-[#292923]-500">
                    {conversationCount === 1
                      ? "Conversation"
                      : "Conversations"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact metadata */}
            <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
              <MetadataCard
                icon={Hash}
                label="Contact ID"
                value={contact.id}
                accent="indigo"
                breakAll
              />

              <MetadataCard
                icon={Radio}
                label="Connected channels"
                value={channels.length ? channels.join(", ") : "None linked"}
                accent="teal"
              />

              <MetadataCard
                icon={CalendarDays}
                label="Added to workspace"
                value={dateFormatter.format(contact.createdAt)}
                accent="amber"
              />

              <MetadataCard
                icon={CheckCircle2}
                label="Profile completeness"
                value={`${populatedFields} of ${contact.business.contactFields.length} fields populated`}
                accent="violet"
              />
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Profile fields */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-400/80 bg-white shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold tracking-tight text-[#292923]-950">
                    Profile intelligence
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#292923]-500">
                    Configured fields and collected contact facts.
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-[#292923]-600">
                {contact.business.contactFields.length}
              </span>
            </div>

            {contact.business.contactFields.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No profile fields configured"
                message="Add contact fields to start organizing information collected about this contact."
                href="/contact-fields"
                linkLabel="View contact fields"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {contact.business.contactFields.map((field) => {
                  const profileValue = contact.profileValues.find(
                    (item) => item.field.id === field.id,
                  );

                  const hasValue =
                    typeof profileValue?.value === "string" &&
                    profileValue.value.trim().length > 0;

                  return (
                    <article
                      key={field.id}
                      className="px-5 py-5 transition-colors hover:bg-[#292923]-50/70 sm:px-6"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${hasValue
                            ? "bg-teal-50 text-teal-700"
                            : "bg-slate-100 text-[#292923]-400"
                            }`}
                        >
                          {hasValue ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#292923]-800">
                              {field.label}
                            </h3>

                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${hasValue
                                ? "bg-teal-50 text-teal-700"
                                : "bg-amber-50 text-amber-700"
                                }`}
                            >
                              {hasValue ? "Collected" : "Missing"}
                            </span>
                          </div>

                          {field.description && (
                            <p className="mt-1 text-xs leading-5 text-[#292923]-400">
                              {field.description}
                            </p>
                          )}

                          <div
                            className={`mt-3 rounded-xl border p-3.5 ${hasValue
                              ? "border-slate-100 bg-slate-50/80"
                              : "border-dashed border-slate-400 bg-white"
                              }`}
                          >
                            <p className="break-words text-sm leading-6 text-[#292923]-800">
                              {hasValue ? (
                                profileValue!.value
                              ) : (
                                <span className="italic text-[#292923]-400">
                                  Not provided yet
                                </span>
                              )}
                            </p>

                            {profileValue && (
                              <div className="mt-3 border-t border-slate-400/70 pt-2.5">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#292923]-500">
                                  <span className="inline-flex items-center gap-1.5">
                                    <Radio className="h-3 w-3" />
                                    Source: {profileValue.source}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock3 className="h-3 w-3" />
                                    {dateTimeFormatter.format(
                                      profileValue.updatedAt,
                                    )}
                                  </span>
                                </div>

                                {profileValue.evidence && (
                                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                      Supporting evidence
                                    </p>
                                    <p className="break-words text-xs leading-5 text-[#292923]-600">
                                      {profileValue.evidence}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Conversation history */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-400/80 bg-white shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold tracking-tight text-[#292923]-950">
                    Conversation history
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#292923]-500">
                    Messages across linked channels.
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-teal-700">
                {conversationCount}
              </span>
            </div>

            {conversationCount === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No conversations yet"
                message="When this contact starts a conversation through a connected channel, its history will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {contact.conversations.map((conversation) => (
                  <article key={conversation.id} className="p-5 sm:p-6">
                    {/* Conversation header */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#292923]-600">
                        <MessageCircle className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-[#292923]-900">
                            {conversation.channel}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Recorded
                          </span>
                        </div>

                        <p className="mt-1 break-all text-xs leading-5 text-[#292923]-500">
                          {conversation.externalId}
                        </p>

                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#292923]-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          Updated{" "}
                          {dateTimeFormatter.format(conversation.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    {conversation.messages.length === 0 ? (
                      <div className="mt-5 rounded-xl border border-dashed border-slate-400 bg-slate-50/70 px-4 py-6 text-center">
                        <p className="text-sm text-[#292923]-500">
                          No messages available for this conversation.
                        </p>
                      </div>
                    ) : (
                      <div className="relative mt-5 space-y-3 border-l-2 border-slate-100 pl-4 sm:pl-5">
                        {conversation.messages
                          .slice()
                          .reverse()
                          .map((message) => {
                            const role = message.role.toLowerCase();
                            const isAssistant =
                              role === "assistant" ||
                              role === "ai" ||
                              role === "agent";

                            return (
                              <div
                                key={message.id}
                                className={`relative rounded-xl border p-3.5 ${isAssistant
                                  ? "border-indigo-100 bg-indigo-50/60"
                                  : "border-slate-100 bg-slate-50/80"
                                  }`}
                              >
                                <span
                                  className={`absolute -left-[23px] top-4 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${isAssistant
                                    ? "bg-indigo-500 ring-indigo-200"
                                    : "bg-slate-400 ring-slate-200"
                                    }`}
                                />

                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <span
                                    className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isAssistant
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-white text-[#292923]-600"
                                      }`}
                                  >
                                    {message.role}
                                  </span>

                                  <time
                                    className="text-[11px] text-[#292923]-400"
                                    dateTime={message.createdAt.toISOString()}
                                  >
                                    {messageTimeFormatter.format(
                                      message.createdAt,
                                    )}
                                  </time>
                                </div>

                                <p className="break-words whitespace-pre-wrap text-sm leading-6 text-[#292923]-700">
                                  {message.content}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function MetadataCard({
  icon: Icon,
  label,
  value,
  accent,
  breakAll = false,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  accent: "indigo" | "teal" | "amber" | "violet";
  breakAll?: boolean;
}) {
  const accents = {
    indigo: "bg-indigo-50 text-indigo-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-slate-400 hover:bg-white">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-medium text-[#292923]-500">{label}</p>
      </div>
      <p
        className={`mt-3 text-sm font-semibold leading-5 text-[#292923]-800 ${breakAll ? "break-all" : "break-words"
          }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
  href,
  linkLabel,
}: {
  icon: typeof Hash;
  title: string;
  message: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#292923]-400">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#292923]-800">{title}</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#292923]-500">
        {message}
      </p>

      {href && linkLabel && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          {linkLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

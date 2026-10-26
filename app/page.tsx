
import {
  Activity,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Command,
  Database,
  MessageCircle,
  MoreHorizontal,
  PanelLeft,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SidebarToggle } from "@/app/components/sidebar-toggle";

import { getDashboardData } from "@/app/features/dashboard/queries/get-dashboard-data";

function SectionHeading({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {href && action ? (
        <Link
          href={href}
          className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          {action} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "blue" | "amber" | "red";
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
    red: "bg-rose-50 text-rose-700 ring-rose-600/15",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

function formatRelativeTime(date: Date | string) {
  const timestamp = new Date(date).getTime();
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getInitials(name: string | null) {
  if (!name?.trim()) return "LE";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getRunTone(status: string): "green" | "blue" | "amber" | "red" {
  switch (status) {
    case "COMPLETED":
      return "green";
    case "FAILED":
      return "red";
    case "RUNNING":
      return "blue";
    default:
      return "amber";
  }
}

function getRunLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "RUNNING":
      return "Running";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
}

export default async function Home() {
  const data = await getDashboardData();
  const { metrics } = data;

  const metricCards = [
    {
      label: "Total leads",
      value: metrics.totalContacts,
      description: `${metrics.contactsCreatedToday} added today`,
      icon: Users,
    },
    {
      label: "Conversations",
      value: metrics.totalConversations,
      description: `${metrics.conversationsToday} started today`,
      icon: MessageCircle,
    },
    {
      label: "Active AI agents",
      value: metrics.activeAgents,
      description: `${metrics.totalAgents} configured`,
      icon: Bot,
    },
    {
      label: "Agent runs today",
      value: metrics.runsToday,
      description: `${metrics.successfulRunsToday} completed · ${metrics.failedRunsToday} failed`,
      icon: Activity,
    },
  ];

  const totalWeeklyRuns = data.runsThisWeek.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="flex min-h-screen">

        <main id="overview" className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <SidebarToggle />

              <div>
                <div className="text-sm text-slate-500">
                  Workspace / Overview
                </div>
                <div className="mt-0.5 text-sm font-semibold">Dashboard</div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live database data
              </span>
              <Link
                href="/leads"
                className="rounded-lg bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm"
              >
                View leads
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <Sparkles size={13} className="text-violet-600" />
                  Your AI lead workspace
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Dashboard overview
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Track your leads, conversations, and agent execution activity
                  using data stored in your workspace.
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                Updated {formatRelativeTime(data.generatedAt)}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="max-w-[190px] text-sm font-medium leading-5 text-slate-500">
                        {metric.label}
                      </p>
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <Icon size={18} />
                      </div>
                    </div>
                    <div className="mt-5 text-3xl font-bold tracking-tight tabular-nums">
                      {metric.value.toLocaleString()}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {metric.description}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_1fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6">
                <SectionHeading
                  title="Lead activity"
                  description="A real-time snapshot of contacts and agent activity."
                  href="/leads"
                  action="View all leads"
                />

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Total leads",
                      value: metrics.totalContacts,
                      color: "bg-slate-400",
                    },
                    {
                      label: "Added today",
                      value: metrics.contactsCreatedToday,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Conversations",
                      value: metrics.totalConversations,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Runs this week",
                      value: totalWeeklyRuns,
                      color: "bg-violet-500",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="mt-2 text-2xl font-bold tabular-nums">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{
                            width: `${totalWeeklyRuns > 0
                              ? Math.min(
                                100,
                                (item.value / Math.max(
                                  metrics.totalContacts,
                                  metrics.totalConversations,
                                  totalWeeklyRuns,
                                  1,
                                )) * 100,
                              )
                              : item.value > 0
                                ? 100
                                : 0
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <SectionHeading
                    title="Recent leads"
                    description="Recently updated contacts in your workspace."
                    href="/leads"
                    action="See all"
                  />
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                        <th className="pb-3 font-medium">Contact</th>
                        <th className="pb-3 font-medium">Conversations</th>
                        <th className="pb-3 text-right font-medium">Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentContacts.map((contact) => (
                        <tr
                          key={contact.id}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-4 pr-3">
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="flex items-center gap-3"
                            >
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                {getInitials(contact.name)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {contact.name || "Unnamed contact"}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {contact.phone || contact.email || "No contact details"}
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 pr-3 text-sm text-slate-600">
                            {contact._count.conversations}
                          </td>
                          <td className="py-4 text-right text-xs text-slate-400">
                            {formatRelativeTime(contact.updatedAt)}
                          </td>
                        </tr>
                      ))}
                      {data.recentContacts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-10 text-center text-sm text-slate-500"
                          >
                            No leads yet. Incoming inquiries will appear here
                            when they create contacts.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-5">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                      <Bot size={21} />
                    </div>
                    <StatusBadge
                      label={
                        metrics.activeAgents > 0
                          ? "Agent active"
                          : "No active agents"
                      }
                      tone={metrics.activeAgents > 0 ? "green" : "amber"}
                    />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">Your AI agents</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Agent configuration and channel availability from your
                    saved workspace settings.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-slate-400">WhatsApp channels</div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                        <MessageCircle size={15} className="text-emerald-400" />
                        {metrics.activeWhatsAppChannels} active
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-slate-400">Contact fields</div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                        <Zap size={15} className="text-amber-300" />
                        {metrics.activeFields} active
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/contacts/fields"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Configure contact fields
                  </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
                  <SectionHeading
                    title="Recent executions"
                    description="Latest persisted agent runs and their outcomes."
                  />

                  <div className="mt-4 space-y-1">
                    {data.recentRuns.map((run) => {
                      const tone = getRunTone(run.status);
                      const Icon =
                        run.status === "COMPLETED"
                          ? CheckCircle2
                          : run.status === "FAILED"
                            ? CircleAlert
                            : run.status === "RUNNING"
                              ? Activity
                              : Clock3;

                      return (
                        <div
                          key={run.id}
                          className="flex items-start gap-3 rounded-lg py-3"
                        >
                          <div
                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${tone === "green"
                              ? "bg-emerald-50 text-emerald-600"
                              : tone === "red"
                                ? "bg-rose-50 text-rose-600"
                                : tone === "amber"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-slate-800">
                              {run.event?.type || "Agent execution"}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">
                              {run.agentName}
                              {run.event?.source ? ` · ${run.event.source}` : ""}
                              {run.error ? ` · ${run.error}` : ""}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <StatusBadge
                                label={getRunLabel(run.status)}
                                tone={tone}
                              />
                              <span className="text-[11px] text-slate-400">
                                {formatRelativeTime(run.startedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {data.recentRuns.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-500">
                        No agent runs recorded yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Sparkles size={19} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">
                    Improve your agent&apos;s knowledge
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Maintain business data in datasets and configure the fields
                    OPTR can capture from incoming inquiries.
                  </p>
                </div>
              </div>
              <Link
                href="/datasets"
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Database size={16} />
                Manage datasets
              </Link>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs text-slate-400">
              <span>OPTR · AI lead operations</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Metrics from persisted workspace records
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

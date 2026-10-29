
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { getSession } from "@/app/lib/auth-session";
import { getDashboardData } from "@/app/features/dashboard/queries/get-dashboard-data";

function formatRelativeTime(date: Date | string) {
  const timestamp = new Date(date).getTime();
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60_000),
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function RunStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-rose-50 text-rose-700",
    RUNNING: "bg-blue-50 text-blue-700",
    PENDING: "bg-amber-50 text-amber-700",
  };

  const labels: Record<string, string> = {
    COMPLETED: "Completed",
    FAILED: "Failed",
    RUNNING: "Running",
    PENDING: "Pending",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id);
  const { metrics } = data;

  const failedRuns = data.recentRuns.filter(
    (run) => run.status === "FAILED",
  );

  const hasActiveAgent = metrics.activeAgents > 0;
  const hasActiveWhatsApp = metrics.activeWhatsAppChannels > 0;

  return (
    <main className="min-h-screen min-w-0 bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <p className="text-xs text-slate-500">Workspace</p>
            <h1 className="text-sm font-semibold">Overview</h1>
          </div>
        </div>

        <Link
          href="/leads"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Users size={16} />
          View leads
        </Link>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Your workspace at a glance
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Overview
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Focus on new leads and conversations that need your attention.
            </p>
          </div>

          <Link
            href="/leads"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            Open lead inbox <ArrowRight size={15} />
          </Link>
        </section>

        {/* Three essential metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total leads"
            value={metrics.totalContacts}
            description={`${metrics.contactsCreatedToday} added today`}
            icon={Users}
          />
          <MetricCard
            label="Conversations"
            value={metrics.totalConversations}
            description={`${metrics.conversationsToday} started today`}
            icon={MessageCircle}
          />
          <MetricCard
            label="Agent runs today"
            value={metrics.runsToday}
            description={`${metrics.successfulRunsToday} completed · ${metrics.failedRunsToday} failed`}
            icon={Activity}
          />
        </section>

        {/* Setup and errors are shown only when relevant */}
        {(!hasActiveAgent || !hasActiveWhatsApp || failedRuns.length > 0) && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <AlertCircle size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Needs your attention</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Resolve these items to keep your lead workflow running smoothly.
                </p>

                <div className="mt-4 space-y-3">
                  {!hasActiveAgent && (
                    <Link
                      href="/agents"
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100"
                    >
                      <span>No active AI agent is configured.</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}

                  {!hasActiveWhatsApp && (
                    <Link
                      href="/settings"
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm hover:bg-slate-100"
                    >
                      <span>No active WhatsApp channel was found.</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}

                  {failedRuns.length > 0 && (
                    <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-3">
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-rose-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-rose-800">
                          {failedRuns.length} failed run
                          {failedRuns.length === 1 ? "" : "s"} in recent activity
                        </p>
                        <p className="mt-1 text-xs text-rose-700">
                          Check recent executions below for details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
          {/* Recent leads */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 className="font-semibold">Recent leads</h2>
                <p className="mt-1 text-sm text-slate-500">
                  The latest contacts in your workspace.
                </p>
              </div>
              <Link
                href="/leads"
                className="shrink-0 text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                View all <ArrowRight className="ml-1 inline" size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data.recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {getInitials(contact.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {contact.name || "Unnamed contact"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {contact.phone || contact.email || "No contact details"}
                    </p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-slate-500">
                      {contact._count.conversations} conversation
                      {contact._count.conversations === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatRelativeTime(contact.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}

              {data.recentContacts.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Users className="mx-auto text-slate-300" size={28} />
                  <p className="mt-3 text-sm font-medium">No leads yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Incoming inquiries will appear here when contacts are created.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <Link
                href="/leads"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Open all leads <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Compact system status */}
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Agent status</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your automated lead handling.
                  </p>
                </div>
                <Bot className="text-slate-500" size={20} />
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600">AI agent</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    {hasActiveAgent ? (
                      <>
                        <CheckCircle2
                          size={15}
                          className="text-emerald-600"
                        />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle size={15} className="text-amber-600" />
                        Not configured
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600">WhatsApp</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <span
                      className={`size-2 rounded-full ${
                        hasActiveWhatsApp ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {hasActiveWhatsApp ? "Connected" : "Not connected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600">Configured agents</span>
                  <span className="text-sm font-medium">
                    {metrics.totalAgents}
                  </span>
                </div>
              </div>

              <Link
                href="/agents"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
              >
                Manage agents <ArrowRight size={15} />
              </Link>
            </div>

            {/* Only a few recent executions; full logs belong elsewhere */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Recent activity</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest agent executions.
                  </p>
                </div>
                <Clock3 className="text-slate-400" size={19} />
              </div>

              <div className="mt-4 space-y-4">
                {data.recentRuns.slice(0, 3).map((run) => (
                  <div key={run.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {run.status === "COMPLETED" ? (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-600"
                        />
                      ) : run.status === "FAILED" ? (
                        <AlertCircle size={17} className="text-rose-600" />
                      ) : (
                        <Clock3 size={17} className="text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {run.event?.type || "Agent execution"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {run.agentName}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <RunStatus status={run.status} />
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(run.startedAt)}
                        </span>
                      </div>
                      {run.status === "FAILED" && run.error && (
                        <p className="mt-2 break-words text-xs text-rose-600">
                          {run.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {data.recentRuns.length === 0 && (
                  <p className="py-5 text-center text-sm text-slate-500">
                    No agent activity recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Secondary destinations are links, not dashboard sections */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-sm font-semibold">Business knowledge</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage datasets used by your AI agent to answer inquiries.
            </p>
          </div>
          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
          >
            Manage datasets <ArrowRight size={15} />
          </Link>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs text-slate-400">
          <span>OPTR · AI lead operations</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Workspace activity
          </span>
        </footer>
      </div>
    </main>
  );
}

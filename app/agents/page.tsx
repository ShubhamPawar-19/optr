
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Database,
  MessageSquare,
  Plus,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";
import {
  createAgent,
  setAgentActive,
} from "@/app/features/agents/actions";

export const dynamic = "force-dynamic";

const DEFAULT_INSTRUCTIONS = `You are a helpful business assistant.

Your job is to understand customer inquiries, search the business's datasets when needed, answer using only information returned by your tools, and help the customer take the next appropriate step.

Rules:
- Never invent records, prices, availability, or business information.
- When a customer asks about information that may exist in business data, discover available datasets and search the relevant dataset.
- Only state facts supported by tool results.
- If no matching records are found, say so clearly.
- Ask a concise follow-up question when essential information is missing.
- Be concise, professional, and helpful.
- Treat datasets as read-only. Never claim to create, update, or delete records.
- Only access data belonging to the current business.`;

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-[#292923] outline-none transition placeholder:text-[#292923]/40 hover:border-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";

const labelClass = "mb-2 block text-sm font-medium text-[#292923]/80";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const business = await getCurrentBusiness();
  const params = await searchParams;

  const agents = business
    ? await db.agent.findMany({
        where: { businessId: business.id },
        orderBy: { name: "asc" },
      })
    : [];

  const activeAgent = agents.find((agent) => agent.isActive);
  const inactiveCount = agents.filter((agent) => !agent.isActive).length;

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto w-full max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Workspace header */}
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#292923]/50">
              </div>

              <h1 className="mt-1 text-lg font-semibold tracking-tight">
                Agent management
              </h1>
            </div>
          </div>

          <Link
            href="/integrations/whatsapp"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-[#292923]/80 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <MessageSquare size={15} />
            <span>WhatsApp settings</span>
            <ArrowUpRight size={13} />
          </Link>
        </header>

        {!business && (
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 shrink-0" size={18} />
            <p>
              Your workspace could not be found. Sign in again before managing
              agents.
            </p>
          </div>
        )}

        {params.created === "1" && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-semibold">Agent created successfully</p>
              <p className="mt-1 text-emerald-800">
                Review its instructions below and activate it when it is ready.
              </p>
            </div>
          </div>
        )}

        {business && (
          <>
            {/* Page introduction */}
            <section className="flex flex-col justify-between gap-4 pb-5 pt-7 sm:flex-row sm:items-end sm:pb-6 sm:pt-8">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
                  <span className="size-1.5 rounded-full bg-indigo-500" />
                  Configuration
                </div>

                <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
                  Build agents that work for your business.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
                  Configure AI assistants, manage their instructions, and
                  control which agent handles incoming customer inquiries.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]/60">
                <CalendarClock size={15} className="text-emerald-600" />
                <span>Live workspace configuration</span>
              </div>
            </section>

            {/* Overview cards */}
            <section
              aria-label="Agent overview"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              <OverviewCard
                icon={<Bot size={19} />}
                label="Total agents"
                value={agents.length.toLocaleString("en-IN")}
                detail="Created in this workspace"
                accent="indigo"
              />

              <OverviewCard
                icon={<Activity size={19} />}
                label="Active agent"
                value={activeAgent ? "Running" : "Not configured"}
                detail={
                  activeAgent
                    ? activeAgent.name
                    : "Activate an agent to process inquiries"
                }
                accent={activeAgent ? "teal" : "amber"}
              />

              <OverviewCard
                icon={<Database size={19} />}
                label="Inactive agents"
                value={inactiveCount.toLocaleString("en-IN")}
                detail="Available to configure and activate"
                accent="amber"
              />
            </section>

            {/* Active agent status */}
            <section
              className={`mt-6 overflow-hidden rounded-xl border bg-white shadow-sm sm:mt-7 ${
                activeAgent ? "border-emerald-200" : "border-slate-300/80"
              }`}
            >
              <div
                className={`h-1 ${
                  activeAgent ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />

              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      activeAgent
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {activeAgent ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <CircleAlert size={20} />
                    )}
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#292923]">
                      {activeAgent
                        ? "Your agent is active"
                        : "No active agent"}
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[#292923]/60">
                      {activeAgent
                        ? `${activeAgent.name} is selected by the current WhatsApp agent resolver. Make sure its instructions and model are configured correctly.`
                        : "Create an agent and activate it to enable agent processing for incoming WhatsApp inquiries."}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    activeAgent
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      activeAgent ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {activeAgent ? "Active" : "Action required"}
                </span>
              </div>
            </section>

            {/* Main content */}
            <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:mt-7">
              {/* Create agent */}
              <section className="min-w-0 overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
                <div className="border-b border-slate-300 px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#292923] text-white">
                      <Plus size={18} />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold tracking-tight">
                        Create an agent
                      </h2>
                      <p className="mt-0.5 text-xs text-[#292923]/60">
                        Configure a new AI assistant
                      </p>
                    </div>
                  </div>
                </div>

                <form action={createAgent} className="space-y-5 p-5 sm:p-6">
                  <div>
                    <label className={labelClass} htmlFor="agent-name">
                      Agent name
                    </label>

                    <input
                      id="agent-name"
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      defaultValue="WhatsApp Business Agent"
                      placeholder="e.g. Customer Support Agent"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="agent-description">
                      Description
                      <span className="ml-1 font-normal text-[#292923]/40">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="agent-description"
                      name="description"
                      maxLength={500}
                      defaultValue="Handles customer inquiries using business data."
                      placeholder="What is this agent responsible for?"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="agent-model">
                      Model identifier
                    </label>

                    <input
                      id="agent-model"
                      name="model"
                      required
                      maxLength={200}
                      defaultValue={
                        process.env.OPENROUTER_MODEL ?? "openrouter/free"
                      }
                      placeholder="Provider/model-name"
                      className={inputClass}
                    />

                    <p className="mt-2 text-xs leading-5 text-[#292923]/60">
                      Use a model identifier supported by your configured AI
                      provider.
                    </p>
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="agent-instructions"
                    >
                      Agent instructions
                    </label>

                    <textarea
                      id="agent-instructions"
                      name="instructions"
                      required
                      minLength={20}
                      maxLength={12000}
                      rows={11}
                      defaultValue={DEFAULT_INSTRUCTIONS}
                      placeholder="Describe the agent's role, behavior, and rules..."
                      className={`${inputClass} resize-y leading-6`}
                    />

                    <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#292923]/60">
                      <Sparkles
                        size={14}
                        className="mt-0.5 shrink-0 text-violet-500"
                      />
                      <p>
                        Define how your agent responds, uses business data,
                        handles uncertainty, and escalates to a human.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="agent-temperature"
                    >
                      Temperature
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        id="agent-temperature"
                        name="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        defaultValue="0.3"
                        required
                        className={`${inputClass} max-w-36`}
                      />

                      <p className="text-xs leading-5 text-[#292923]/60">
                        0 = more predictable. Higher values = more variation.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <CircleAlert
                        size={16}
                        className="mt-0.5 shrink-0 text-[#292923]/55"
                      />

                      <p className="text-xs leading-5 text-[#292923]/70">
                        New agents are created inactive. Review the
                        configuration before activating an agent for customer
                        conversations.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#292923] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#292923]/85 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <Plus size={16} />
                    Create agent
                    <ArrowUpRight size={14} />
                  </button>
                </form>
              </section>

              {/* Agent list */}
              <section className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">
                      Your agents
                    </h2>
                    <p className="mt-0.5 text-xs text-[#292923]/60">
                      Manage your workspace assistants.
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#292923]/65">
                    {agents.length.toLocaleString("en-IN")}{" "}
                    {agents.length === 1 ? "agent" : "agents"}
                  </span>
                </div>

                {agents.length === 0 ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-slate-300/80 bg-white px-6 py-12 text-center shadow-sm">
                    <div className="flex size-14 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-[#292923]/60">
                      <Bot size={25} strokeWidth={1.7} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-[#292923]/90">
                      Your agents will appear here
                    </h3>

                    <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#292923]/60">
                      Create your first agent using the form to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <article
                        key={agent.id}
                        className="rounded-xl border border-slate-300/80 bg-white p-5 shadow-sm transition duration-200 hover:border-slate-400 hover:shadow-md sm:p-6"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                              agent.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-[#292923]/65"
                            }`}
                          >
                            <Bot size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words text-sm font-semibold text-[#292923]/90">
                                {agent.name}
                              </h3>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                                  agent.isActive
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-slate-100 text-[#292923]/65"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    agent.isActive
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />
                                {agent.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <p className="mt-1 break-words text-sm leading-5 text-[#292923]/60">
                              {agent.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[#292923]/45">
                              Model
                            </p>

                            <p
                              className="mt-1 truncate text-sm font-medium text-[#292923]/80"
                              title={agent.model}
                            >
                              {agent.model}
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[#292923]/45">
                              Temperature
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#292923]/80">
                              {agent.temperature ?? 0.3}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#292923]/45">
                            Instructions preview
                          </p>

                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#292923]/65">
                            {agent.instructions.length > 220
                              ? `${agent.instructions.slice(0, 220).trimEnd()}…`
                              : agent.instructions}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                          <span className="text-xs text-[#292923]/50">
                            {agent.isActive
                              ? "Selected as active in the current resolver"
                              : "Not processing inquiries"}
                          </span>

                          <form action={setAgentActive}>
                            <input
                              type="hidden"
                              name="agentId"
                              value={agent.id}
                            />

                            <input
                              type="hidden"
                              name="active"
                              value={agent.isActive ? "false" : "true"}
                            />

                            <button
                              type="submit"
                              className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-semibold transition focus:outline-none focus:ring-4 ${
                                agent.isActive
                                  ? "border border-slate-300 bg-white text-[#292923]/75 hover:bg-slate-50 focus:ring-slate-100"
                                  : "bg-[#292923] text-white hover:bg-[#292923]/85 focus:ring-indigo-100"
                              }`}
                            >
                              {agent.isActive ? (
                                <Activity size={14} />
                              ) : (
                                <Zap size={14} />
                              )}

                              {agent.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </form>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* Dataset connection */}
                <div className="rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Database size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#292923]/90">
                        Connect your business data
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#292923]/60">
                        Configure datasets so your agent can find relevant
                        business information when answering inquiries.
                      </p>

                      <Link
                        href="/datasets"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#292923]/75 transition hover:text-indigo-700"
                      >
                        View datasets
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Workspace footer */}
            <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 py-4">
              <p className="text-xs text-[#292923]/50">
                OPTR · Agent management
              </p>

              <Link
                href="/integrations/whatsapp"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292923]/60 transition hover:text-indigo-600"
              >
                <MessageSquare size={13} />
                WhatsApp settings
                <ArrowUpRight size={12} />
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  accent: "indigo" | "teal" | "amber";
}) {
  const accents = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      marker: "bg-indigo-500",
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
    <article className="relative overflow-hidden rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${accents.glow} to-transparent opacity-80`}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#292923]/60">{label}</p>

          <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-[#292923]">
            {value}
          </p>
        </div>

        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${accents.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
        <span className={`size-1.5 shrink-0 rounded-full ${accents.marker}`} />

        <p className="truncate text-xs text-[#292923]/60" title={detail}>
          {detail}
        </p>
      </div>
    </article>
  );
}

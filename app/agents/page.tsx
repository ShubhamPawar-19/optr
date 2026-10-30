import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  Database,
  MessageSquare,
  Plus,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

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
    <main className="min-h-full bg-slate-50/70">
      <div className="mx-auto w-full max-w-[1440px] space-y-7 p-5 sm:p-7 lg:p-10">
        {/* Page header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Settings2 size={14} />
              <span>Configuration</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">AI Agents</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <Bot size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  AI Agents
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Build and manage the AI assistants for your business.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/integrations/whatsapp"
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:self-center"
          >
            <MessageSquare size={16} />
            WhatsApp settings
          </Link>
        </header>

        {!business && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 shrink-0" size={18} />
            <p>
              Your workspace could not be found. Sign in again before managing
              agents.
            </p>
          </div>
        )}

        {params.created === "1" && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
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
            {/* Overview cards */}
            <section className="grid gap-4 sm:grid-cols-3">
              <OverviewCard
                icon={<Bot size={19} />}
                label="Total agents"
                value={agents.length.toString()}
                detail="Created in this workspace"
                iconClass="bg-slate-100 text-slate-700"
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
                iconClass={
                  activeAgent
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }
              />
              <OverviewCard
                icon={<Database size={19} />}
                label="Inactive agents"
                value={inactiveCount.toString()}
                detail="Available to configure and activate"
                iconClass="bg-violet-50 text-violet-700"
              />
            </section>

            {/* Active agent status */}
            <section
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                activeAgent ? "border-emerald-200" : "border-slate-200"
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
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
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
                    <h2 className="font-semibold text-slate-950">
                      {activeAgent
                        ? "Your agent is active"
                        : "No active agent"}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      {activeAgent
                        ? `${activeAgent.name} is selected by the current WhatsApp agent resolver. Make sure its instructions and model are configured correctly.`
                        : "Create an agent and activate it to enable agent processing for incoming WhatsApp inquiries."}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
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
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              {/* Create agent */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-950">
                        Create an agent
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
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
                      <span className="ml-1 font-normal text-slate-400">
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
                    <p className="mt-2 text-xs leading-5 text-slate-500">
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
                    <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
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
                    <div className="flex items-center gap-3">
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
                      <p className="text-xs leading-5 text-slate-500">
                        0 = more predictable. Higher values = more variation.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <CircleAlert
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />
                      <p className="text-xs leading-5 text-slate-600">
                        New agents are created inactive. Review the
                        configuration before activating an agent for customer
                        conversations.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    <Plus size={17} />
                    Create agent
                  </button>
                </form>
              </section>

              {/* Agent list */}
              <section className="min-w-0 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                      Your agents
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Manage your workspace assistants.
                    </p>
                  </div>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {agents.length} total
                  </span>
                </div>

                {agents.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <Bot size={27} />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-950">
                      Your agents will appear here
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      Create your first agent using the form to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <article
                        key={agent.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                              agent.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Bot size={22} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words font-semibold text-slate-950">
                                {agent.name}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  agent.isActive
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-slate-100 text-slate-600"
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

                            <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                              {agent.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="min-w-0 rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Model
                            </p>
                            <p
                              className="mt-1 truncate text-sm font-medium text-slate-700"
                              title={agent.model}
                            >
                              {agent.model}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Temperature
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {agent.temperature ?? 0.3}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Instructions preview
                          </p>
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                            {agent.instructions.length > 220
                              ? `${agent.instructions.slice(0, 220).trimEnd()}…`
                              : agent.instructions}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <span className="text-xs text-slate-400">
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
                                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-100"
                                  : "bg-slate-950 text-white hover:bg-slate-800 focus:ring-slate-200"
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

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Database size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Connect your business data
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Configure datasets so your agent can find relevant
                        business information when answering inquiries.
                      </p>
                      <Link
                        href="/datasets"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-slate-500"
                      >
                        View datasets <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
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
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  iconClass: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-slate-500" title={detail}>
        {detail}
      </p>
    </article>
  );
}
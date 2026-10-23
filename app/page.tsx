
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Command,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
  Database,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Leads", icon: Users, count: "12" },
  { label: "Conversations", icon: MessageCircle },
  { label: "Executions", icon: Activity },
  { label: "Datasets", icon: Database },
  { label: "Contacts", icon: Users },
];

const workspaceNavigation = [
  { label: "AI Agent", icon: Bot },
  { label: "Integrations", icon: Workflow },
  { label: "Settings", icon: Settings2 },
];

const metrics = [
  {
    label: "Customers responded to",
    value: "128",
    change: "+12.8%",
    description: "vs. previous 7 days",
    icon: MessageCircle,
    positive: true,
  },
  {
    label: "Active leads",
    value: "34",
    change: "+8.2%",
    description: "vs. previous 7 days",
    icon: Users,
    positive: true,
  },
  {
    label: "Qualified leads",
    value: "18",
    change: "+5.4%",
    description: "vs. previous 7 days",
    icon: CheckCircle2,
    positive: true,
  },
  {
    label: "Visits requested",
    value: "06",
    change: "-2.1%",
    description: "vs. previous 7 days",
    icon: CalendarDays,
    positive: false,
  },
];

const leads = [
  {
    name: "Aarav Mehta",
    initials: "AM",
    property: "3 BHK · Baner",
    budget: "₹1.2–1.5 Cr",
    status: "Qualified",
    tone: "green",
    time: "4 min ago",
  },
  {
    name: "Priya Sharma",
    initials: "PS",
    property: "2 BHK · Wakad",
    budget: "₹75–90 L",
    status: "Interested",
    tone: "blue",
    time: "18 min ago",
  },
  {
    name: "Rohan Desai",
    initials: "RD",
    property: "4 BHK · Hinjawadi",
    budget: "₹1.6–2 Cr",
    status: "Visit requested",
    tone: "violet",
    time: "32 min ago",
  },
  {
    name: "Ananya Kulkarni",
    initials: "AK",
    property: "2 BHK · Kharadi",
    budget: "₹85–95 L",
    status: "Follow-up",
    tone: "amber",
    time: "1 hr ago",
  },
];

const executions = [
  {
    title: "WhatsApp inquiry handled",
    detail: "Message received · Lead qualification",
    time: "2 min ago",
    status: "Completed",
    tone: "green",
  },
  {
    title: "Property recommendations",
    detail: "Property search · 3 results found",
    time: "8 min ago",
    status: "Completed",
    tone: "green",
  },
  {
    title: "Follow-up execution",
    detail: "Waiting for next scheduled action",
    time: "14 min ago",
    status: "Scheduled",
    tone: "blue",
  },
  {
    title: "Customer inquiry",
    detail: "Needs review",
    time: "21 min ago",
    status: "Needs review",
    tone: "amber",
  },
];

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
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
      {action && (
        <button className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
          {action} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/15",
    violet: "bg-violet-50 text-violet-700 ring-violet-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[tone] ?? styles.blue}`}
    >
      {label}
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Command size={21} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">optr</div>
              <div className="text-[11px] text-slate-500">
                AI lead operations
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 p-4">
            <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50">
              <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700">
                RE
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  Realty Workspace
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Starter workspace
                </div>
              </div>
              <ChevronDown size={15} className="text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
            <div>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Workspace
              </p>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={
                        item.label === "Overview"
                          ? "#overview"
                          : item.label === "Contacts"
                            ? "/contacts"
                            : item.label === "Datasets"
                              ? "/datasets"
                              : "#"
                      }
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${item.active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                    >
                      <Icon size={17} />
                      <span className="flex-1">{item.label}</span>
                      {item.count && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {item.count}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Configuration
              </p>
              <div className="space-y-1">
                {workspaceNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href="#"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      <Icon size={17} />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="m-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <ShieldCheck size={16} className="text-emerald-600" />
              Your workspace
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Your agent, property data, and lead activity in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              OP
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Workspace owner</div>
              <div className="text-xs text-slate-500">Administrator</div>
            </div>
            <MoreHorizontal size={18} className="text-slate-400" />
          </div>
        </aside>

        <main id="overview" className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-slate-200 lg:hidden">
                <Command size={18} />
              </div>
              <div>
                <div className="text-sm text-slate-500">Workspace / Overview</div>
                <div className="mt-0.5 text-sm font-semibold">Dashboard</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 sm:flex">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Demo data
              </div>
              <button
                aria-label="Search"
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <Search size={17} />
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm">
                <Plus size={16} />
                <span className="hidden sm:inline">Add property</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <Sparkles size={13} className="text-violet-600" />
                  Your AI sales workspace
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Good morning.
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Monitor your conversations, track interested buyers, and see
                  how your AI agent is performing.
                </p>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                <CalendarDays size={16} />
                Last 7 days
                <ChevronDown size={14} />
              </button>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
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
                    <div className="mt-5 flex items-end justify-between gap-2">
                      <span className="text-3xl font-bold tracking-tight tabular-nums">
                        {metric.value}
                      </span>
                      <span
                        className={`mb-1 inline-flex items-center gap-1 text-xs font-semibold ${metric.positive ? "text-emerald-700" : "text-rose-700"
                          }`}
                      >
                        {metric.positive ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                        {metric.change}
                      </span>
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
                  description="A snapshot of your recent lead pipeline."
                  action="View all leads"
                />

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "New", value: "42", width: "72%", color: "bg-slate-400" },
                    { label: "Interested", value: "31", width: "58%", color: "bg-blue-500" },
                    { label: "Qualified", value: "18", width: "42%", color: "bg-emerald-500" },
                    { label: "Visit", value: "6", width: "22%", color: "bg-violet-500" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="mt-2 text-2xl font-bold tabular-nums">
                        {item.value}
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <SectionHeading
                    title="Recent leads"
                    description="Latest prospect activity"
                    action="See all"
                  />
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[570px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                        <th className="pb-3 font-medium">Prospect</th>
                        <th className="pb-3 font-medium">Budget</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 text-right font-medium">Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr
                          key={lead.name}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-4 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                {lead.initials}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {lead.name}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {lead.property}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-3 text-xs font-medium text-slate-600">
                            {lead.budget}
                          </td>
                          <td className="py-4 pr-3">
                            <StatusBadge label={lead.status} tone={lead.tone} />
                          </td>
                          <td className="py-4 text-right text-xs text-slate-400">
                            {lead.time}
                          </td>
                        </tr>
                      ))}
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
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Demo status
                    </span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">Your AI agent</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Your assistant helps handle inquiries and find relevant
                    properties for prospective buyers.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-slate-400">Channels</div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                        <MessageCircle size={15} className="text-emerald-400" />
                        WhatsApp
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-slate-400">Agent tools</div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                        <Zap size={15} className="text-amber-300" />
                        Property search
                      </div>
                    </div>
                  </div>

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                    Configure agent <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
                  <SectionHeading
                    title="Recent executions"
                    description="Monitor agent activity and reliability."
                    action="View logs"
                  />

                  <div className="mt-4 space-y-1">
                    {executions.map((execution) => (
                      <div
                        key={execution.title}
                        className="flex items-start gap-3 rounded-lg py-3"
                      >
                        <div
                          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${execution.tone === "green"
                            ? "bg-emerald-50 text-emerald-600"
                            : execution.tone === "amber"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                            }`}
                        >
                          {execution.tone === "green" ? (
                            <CheckCircle2 size={16} />
                          ) : execution.tone === "amber" ? (
                            <CircleAlert size={16} />
                          ) : (
                            <Clock3 size={16} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-800">
                            {execution.title}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-slate-500">
                            {execution.detail}
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <StatusBadge
                              label={execution.status}
                              tone={execution.tone}
                            />
                            <span className="text-[11px] text-slate-400">
                              {execution.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    Make your agent more effective
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Add your business information and property inventory so the
                    agent can answer customer questions with relevant details.
                  </p>
                </div>
              </div>
              <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Building2 size={16} />
                Manage properties
              </button>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs text-slate-400">
              <span>OPTR · AI lead operations</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Dashboard preview · Demo data
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

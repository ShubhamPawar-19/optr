
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  Headset,
  MessageCircle,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    number: "01",
    icon: MessagesSquare,
    title: "Respond to inquiries",
    description:
      "Give incoming WhatsApp inquiries a consistent first response, even when your team is busy.",
  },
  {
    number: "02",
    icon: Database,
    title: "Answer from your data",
    description:
      "Connect structured business information so the agent can look up relevant details instead of guessing.",
  },
  {
    number: "03",
    icon: Target,
    title: "Qualify the opportunity",
    description:
      "Understand what a prospect needs, collect useful details, and keep the conversation moving.",
  },
  {
    number: "04",
    icon: Headset,
    title: "Keep people in control",
    description:
      "Give your team a conversation history and a place to review inquiries that need human attention.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect your channel",
    description:
      "Start with your WhatsApp business integration and configure the agent for your business.",
  },
  {
    number: "02",
    title: "Give it business context",
    description:
      "Organize your information into datasets that the agent can search when answering questions.",
  },
  {
    number: "03",
    title: "Handle the conversation",
    description:
      "Let the agent respond to inquiries while OPTR records conversations and agent activity for review.",
  },
];

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
        light ? "bg-white text-[#191914]" : "bg-[#25251f] text-white"
      }`}
      aria-hidden="true"
    >
      <span className="text-lg font-black tracking-[-0.08em]">o.</span>
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#8a6743]">
      <span className="h-px w-6 bg-[#c58a51]" />
      {children}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -inset-4 rounded-[2rem] bg-[#d9d0bd]/25 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-[#dcd8ce] bg-white shadow-[0_28px_90px_-35px_rgba(44,38,26,0.3)]">
        <div className="flex h-12 items-center justify-between border-b border-[#eeece6] px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[13px] font-semibold tracking-tight text-[#25251f]">
              optr
            </span>
            <span className="hidden rounded-md bg-[#f4f2ed] px-2 py-1 text-[10px] text-[#77756c] sm:inline">
              Workspace
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#77756c]">
            <span className="size-1.5 rounded-full bg-[#6a9b76]" />
            Product preview
          </div>
        </div>

        <div className="grid min-h-[370px] grid-cols-[106px_minmax(0,1fr)] sm:grid-cols-[145px_minmax(0,1fr)]">
          <aside className="border-r border-[#eeece6] bg-[#fbfaf7] p-2.5 sm:p-3.5">
            <p className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#aaa69b]">
              Workspace
            </p>
            {[
              { icon: Target, label: "Leads", active: true },
              { icon: MessagesSquare, label: "Conversations" },
              { icon: Database, label: "Datasets" },
              { icon: Bot, label: "AI agents" },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2.5 text-[10px] sm:gap-2.5 sm:px-2.5 sm:text-[11px] ${
                  active
                    ? "bg-[#292923] font-medium text-white"
                    : "text-[#77756c]"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                <span className="truncate">{label}</span>
              </div>
            ))}

            <div className="mt-7 border-t border-[#eae7df] pt-4">
              <p className="px-2 text-[9px] leading-4 text-[#aaa69b]">
                INTEGRATIONS
              </p>
              <div className="mt-3 flex items-center gap-2 px-2 text-[10px] text-[#77756c] sm:text-[11px]">
                <MessageCircle size={14} />
                WhatsApp
              </div>
            </div>
          </aside>

          <div className="min-w-0 p-3.5 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-[#8d8a80]">Workspace / Leads</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-[#292923] sm:text-xl">
                  Lead inbox
                </h3>
                <p className="mt-1 text-[10px] leading-4 text-[#8d8a80] sm:text-[11px]">
                  A place for your inbound conversations.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e5dc] px-2.5 py-2 text-[10px] text-[#57574f]">
                <Search size={12} />
                Search
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-[#eae7df] p-3">
                <p className="text-[10px] text-[#8d8a80]">Conversations</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-[#292923]">
                    — 
                  </span>
                  <MessagesSquare size={16} className="text-[#a5a093]" />
                </div>
                <p className="mt-1 text-[9px] text-[#8d8a80]">
                  Your workspace data
                </p>
              </div>
              <div className="rounded-xl border border-[#eae7df] p-3">
                <p className="text-[10px] text-[#8d8a80]">Agent activity</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-[#292923]">
                    —
                  </span>
                  <ActivityIcon />
                </div>
                <p className="mt-1 text-[9px] text-[#8d8a80]">
                  Execution history
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#eae7df]">
              <div className="flex items-center justify-between border-b border-[#eeece6] px-3 py-3">
                <span className="text-[11px] font-semibold text-[#34342d]">
                  Conversation preview
                </span>
                <span className="rounded-md bg-[#f5f2ea] px-2 py-1 text-[9px] text-[#8a6743]">
                  Example
                </span>
              </div>
              <div className="space-y-3 bg-[#fbfaf7] p-3">
                <div className="flex items-start gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e9e4d8] text-[9px] font-semibold text-[#665a49]">
                    P
                  </span>
                  <div className="max-w-[88%] rounded-xl rounded-tl-sm border border-[#e9e5dc] bg-white px-3 py-2.5">
                    <p className="text-[11px] leading-[1.65] text-[#45453d]">
                      Hi, I&apos;m looking for a two-bedroom apartment. What
                      options are available?
                    </p>
                    <p className="mt-1.5 text-[9px] text-[#a09b90]">
                      Example prospect message
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-end gap-2">
                  <div className="max-w-[88%] rounded-xl rounded-tr-sm bg-[#eaeedf] px-3 py-2.5">
                    <p className="text-[11px] leading-[1.65] text-[#394638]">
                      I can help with that. Are you looking to rent or buy,
                      and which area would you prefer?
                    </p>
                    <p className="mt-1.5 text-right text-[9px] text-[#7b8a73]">
                      Example agent response
                    </p>
                  </div>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#292923] text-white">
                    <Bot size={13} />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#eae7df] px-3 py-2.5">
              <ShieldCheck size={14} className="shrink-0 text-[#7b8a73]" />
              <p className="text-[9px] leading-4 text-[#77756c]">
                Illustrative interface and sample messages, not live customer
                data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-center gap-2 text-[10px] text-[#77756c]">
        <span className="size-1.5 rounded-full bg-[#c58a51]" />
        A closer look at the OPTR workflow
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <Zap size={16} className="text-[#a5a093]" />;
}

function FeatureCard({
  number,
  icon: Icon,
  title,
  description,
}: (typeof capabilities)[number]) {
  return (
    <article className="group border-t border-[#ded9ce] py-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] tabular-nums text-[#a09a8d]">
          {number}
        </span>
        <Icon
          size={18}
          strokeWidth={1.6}
          className="text-[#8b765e] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
      <h3 className="mt-7 text-lg font-semibold tracking-tight text-[#292923]">
        {title}
      </h3>
      <p className="mt-2 max-w-[290px] text-[13px] leading-6 text-[#77756c]">
        {description}
      </p>
    </article>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7f2] text-[#292923]">
      <header className="relative z-10 border-b border-[#e8e4da]">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-12"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[19px] font-bold tracking-[-0.06em]">
              optr
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="text-[12px] text-[#66665d] transition hover:text-[#292923]"
            >
              How it works
            </Link>
            <Link
              href="#capabilities"
              className="text-[12px] text-[#66665d] transition hover:text-[#292923]"
            >
              Capabilities
            </Link>
            <Link
              href="#who-its-for"
              className="text-[12px] text-[#66665d] transition hover:text-[#292923]"
            >
              Who it&apos;s for
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-2 py-2 text-[12px] font-medium text-[#4f4f47] transition hover:text-black sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#292923] px-4 text-[12px] font-medium text-white transition hover:bg-[#44443a]"
            >
              Get started <ArrowUpRight size={14} />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(ellipse_at_72%_22%,rgba(224,201,164,0.24),transparent_48%)]"
        />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="max-w-[530px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e3ddcf] bg-white/60 px-3 py-1.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#eee4d4] text-[#8a6743]">
                <Sparkles size={11} />
              </span>
              <span className="text-[10px] font-medium tracking-[0.04em] text-[#6f685c]">
                AI-assisted lead operations
              </span>
            </div>

            <h1 className="max-w-[560px] text-[clamp(2.8rem,6.1vw,5.1rem)] font-medium leading-[0.99] tracking-[-0.075em] text-[#292923]">
              Every inquiry
              <br />
              deserves an
              <br />
              <span className="font-serif font-normal italic tracking-[-0.065em] text-[#9a7147]">
                Attention.
              </span>
            </h1>

            <p className="mt-7 max-w-[420px] text-[15px] leading-7 text-[#6c6a60] sm:text-[16px] sm:leading-8">
              OPTR helps your team respond to inbound WhatsApp inquiries,
              answer questions using your business data, and keep conversations
              organized from first contact to follow-up.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#292923] px-5 text-[13px] text-[#FFFFFF] font-medium transition hover:bg-[#44443a]"
              >
                Get started <ArrowRight size={15} />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#ded9ce] bg-white/60 px-5 text-[13px] font-medium text-[#4d4c44] transition hover:bg-white"
              >
                See how it works <ArrowDownRight size={15} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-[#77756c]">
              <span className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[#75856b]" />
                WhatsApp-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[#75856b]" />
                Your business data
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[#75856b]" />
                Conversation history
              </span>
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-[#e8e4da] bg-[#f0eee6]">
        <div className="mx-auto grid max-w-[1240px] gap-5 px-5 py-7 sm:px-8 md:grid-cols-[1fr_2fr] md:items-center lg:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8a6743]">
            Built around the inquiry
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
            {[
              { label: "Capture", icon: MessageCircle },
              { label: "Understand", icon: Search },
              { label: "Respond", icon: Bot },
              { label: "Review", icon: ShieldCheck },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon size={15} strokeWidth={1.6} className="text-[#8a6743]" />
                <span className="text-[12px] text-[#54534b]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-16 mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="max-w-[460px] text-4xl font-medium leading-[1.08] tracking-[-0.06em] sm:text-5xl">
              From first message to a more organized pipeline.
            </h2>
            <p className="mt-5 max-w-[400px] text-[14px] leading-7 text-[#77756c]">
              Your team shouldn&apos;t have to piece together every inquiry
              across scattered messages. OPTR brings the conversation and
              agent activity into one workspace.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold text-[#765735] transition hover:text-[#292923]"
            >
              Explore OPTR <ArrowRight size={14} />
            </Link>
          </div>

          <div className="border-t border-[#ded9ce]">
            {steps.map((step) => (
              <article
                key={step.number}
                className="grid grid-cols-[44px_1fr] gap-4 border-b border-[#ded9ce] py-7 sm:grid-cols-[64px_1fr] sm:gap-6 sm:py-8"
              >
                <span className="pt-1 text-[11px] tabular-nums text-[#a09a8d]">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[450px] text-[13px] leading-6 text-[#77756c]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className="scroll-mt-16 border-y border-[#e8e4da] bg-[#f0eee6]"
      >
        <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-[570px]">
              <SectionLabel>What OPTR does</SectionLabel>
              <h2 className="text-4xl font-medium leading-[1.08] tracking-[-0.06em] sm:text-5xl">
                Useful automation.
                <br />
                <span className="font-serif font-normal italic text-[#9a7147]">
                  With context.
                </span>
              </h2>
            </div>
            <p className="max-w-[350px] text-[13px] leading-6 text-[#77756c]">
              An agent is only useful when it has the right context and the
              surrounding system keeps track of what happened.
            </p>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <FeatureCard key={capability.number} {...capability} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="who-its-for"
        className="scroll-mt-16 mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionLabel>Start with your business</SectionLabel>
            <h2 className="max-w-[490px] text-4xl font-medium leading-[1.08] tracking-[-0.06em] sm:text-5xl">
              Your answers should come from your business, not guesswork.
            </h2>
            <p className="mt-5 max-w-[440px] text-[14px] leading-7 text-[#77756c]">
              For real-estate teams, that means organizing property details,
              locations, prices, and other useful information so an agent can
              look up relevant records during an inquiry.
            </p>
            <p className="mt-4 max-w-[440px] text-[13px] leading-6 text-[#77756c]">
              The same dataset approach can support other businesses with
              structured information their teams need to reference.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex items-center gap-2 rounded-lg border border-[#dcd6c9] bg-white px-4 py-3 text-[12px] font-semibold transition hover:border-[#b8a78f]"
            >
              Set up your workspace <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#ded9ce] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] text-[#8d8a80]">
                  <Database size={13} />
                  BUSINESS KNOWLEDGE
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  Property inventory
                </h3>
                <p className="mt-1 text-[11px] text-[#8d8a80]">
                  Illustrative dataset structure
                </p>
              </div>
              <span className="rounded-lg border border-[#eae7df] p-2 text-[#77756c]">
                <Workflow size={17} />
              </span>
            </div>

            <div className="mt-7 space-y-2.5">
              {[
                ["Property type", "Apartment"],
                ["Bedrooms", "2"],
                ["Listing type", "Rent"],
                ["Location", "Dubai Marina"],
                ["Availability", "Confirm with your data"],
              ].map(([field, value]) => (
                <div
                  key={field}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[#eeece6] px-3.5 py-3"
                >
                  <span className="text-[11px] text-[#77756c]">{field}</span>
                  <span className="truncate text-right text-[11px] font-medium text-[#42423a]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#f5f2ea] p-3.5">
              <CircleHelp
                size={16}
                className="mt-0.5 shrink-0 text-[#8a6743]"
              />
              <p className="text-[11px] leading-5 text-[#6f685c]">
                Example fields and values only. Your workspace uses the
                information you configure; the example is not a live property
                listing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
        <div className="relative mx-auto max-w-[1160px] overflow-hidden rounded-2xl bg-[#292923] px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-32 size-[400px] rounded-full border border-white/[0.07]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-16 size-[270px] rounded-full border border-white/[0.07]"
          />

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-[620px]">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#d5b18a]">
                A more deliberate way to handle inquiries
              </p>
              <h2 className="text-4xl font-medium leading-[1.08] tracking-[-0.06em] sm:text-5xl">
                Give every conversation a clearer next step.
              </h2>
              <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-white/65">
                Set up your OPTR workspace and start with the inquiry workflow
                your business needs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:flex-col">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#f3eee3] px-5 text-[12px] font-semibold text-[#292923] transition hover:bg-white"
              >
                Get started <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-[12px] font-medium text-white transition hover:bg-white/10"
              >
                Sign in <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e4da]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[15px] font-bold tracking-[-0.06em]">
              optr
            </span>
            <span className="ml-1 text-[11px] text-[#8d8a80]">
              AI lead operations
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] text-[#77756c]">
            <Link href="#how-it-works" className="transition hover:text-black">
              How it works
            </Link>
            <Link href="#capabilities" className="transition hover:text-black">
              Capabilities
            </Link>
            <Link href="/login" className="transition hover:text-black">
              Sign in
            </Link>
          </div>

          <p className="text-[10px] text-[#99958a]">
            © {new Date().getFullYear()} OPTR
          </p>
        </div>
      </footer>
    </main>
  );
}

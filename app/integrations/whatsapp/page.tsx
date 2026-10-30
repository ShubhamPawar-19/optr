
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Webhook,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";
import { WhatsAppSettings } from "./whatsapp-settings";

export const dynamic = "force-dynamic";

export default async function WhatsAppIntegrationPage() {
  const business = await getCurrentBusiness();

  const channel = business
    ? await db.whatsAppChannel.findFirst({
        where: { businessId: business.id },
        select: {
          phoneNumberId: true,
          isActive: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/whatsapp`
    : "/api/webhooks/whatsapp";

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Workspace header */}
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#292923]/50">
              </div>

              <h1 className="mt-1 text-lg font-semibold tracking-tight">
                WhatsApp integration
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#292923]/65 shadow-sm">
            <MessageCircle size={14} className="text-emerald-600" />
            Messaging channel
          </div>
        </header>

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 pb-5 pt-7 sm:flex-row sm:items-end sm:pb-6 sm:pt-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Channel configuration
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
              Connect your WhatsApp Business.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
              Connect your WhatsApp Business number so OPTR can receive
              inquiries and send replies through your AI agent.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]/60">
            <CalendarClock size={15} className="text-emerald-600" />
            <span>Integration settings</span>
          </div>
        </section>

        {!business ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600">
                <ShieldCheck size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-amber-950">
                  Workspace unavailable
                </h3>
                <p className="mt-1 text-sm leading-6 text-amber-900/80">
                  Your workspace could not be found. Sign in with an account
                  associated with a business workspace before connecting
                  WhatsApp.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            {/* Connection settings */}
            <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
                    <MessageCircle size={17} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold tracking-tight">
                      WhatsApp connection
                    </h3>
                    <p className="mt-0.5 text-xs text-[#292923]/60">
                      Manage your WhatsApp Business API credentials
                    </p>
                  </div>
                </div>

                {channel?.isActive ? (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={13} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Not connected
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <WhatsAppSettings
                  channel={
                    channel
                      ? {
                          phoneNumberId: channel.phoneNumberId,
                          isActive: channel.isActive,
                          updatedAt: channel.updatedAt.toISOString(),
                        }
                      : null
                  }
                />
              </div>
            </section>

            {/* Connection instructions */}
            <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-300 px-5 py-4 sm:px-6">
                <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Before you connect
                  </h3>
                  <p className="mt-0.5 text-xs text-[#292923]/60">
                    Prepare your Meta WhatsApp Cloud API credentials
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      1
                    </span>
                    <p className="pt-1 text-sm leading-6 text-[#292923]/70">
                      Open Meta for Developers and select your Meta app with
                      WhatsApp Cloud API configured.
                    </p>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      2
                    </span>
                    <p className="pt-1 text-sm leading-6 text-[#292923]/70">
                      From WhatsApp API Setup, copy the phone number ID for
                      the number you want to connect.
                    </p>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      3
                    </span>
                    <p className="pt-1 text-sm leading-6 text-[#292923]/70">
                      Generate a suitable long-lived access token with the
                      required WhatsApp Business permissions, including{" "}
                      <code className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-indigo-700">
                        whatsapp_business_messaging
                      </code>
                      .
                    </p>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600">
                      4
                    </span>
                    <p className="pt-1 text-sm leading-6 text-[#292923]/70">
                      Enter both values above. OPTR verifies them with Meta
                      before saving the encrypted token.
                    </p>
                  </li>
                </ol>

                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                  <p className="text-xs leading-5 text-amber-900/80">
                    For production use, configure a suitable system-user
                    token in Meta Business settings. Temporary test tokens
                    can expire.
                  </p>
                </div>
              </div>
            </section>

            {/* Webhook configuration */}
            <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-300 px-5 py-4 sm:px-6">
                <div className="flex size-9 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600">
                  <Webhook size={17} />
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Webhook configuration
                  </h3>
                  <p className="mt-0.5 text-xs text-[#292923]/60">
                    Configure incoming WhatsApp events in Meta
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-[#292923]/70">
                  Your Meta app must also point its WhatsApp webhook to your
                  deployed OPTR webhook endpoint. Configure the callback URL,
                  verification token, and app secret according to your
                  existing deployment configuration. Subscribe to the
                  messages webhook field.
                </p>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-[#292923]/60">
                    Callback URL
                  </p>
                  <p className="break-all rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs leading-5 text-[#292923]/75">
                    {webhookUrl}
                  </p>
                </div>

                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                  <p className="text-xs leading-5 text-amber-900/80">
                    Do not enter your Meta app secret or webhook verification
                    token into the access-token field above.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Workspace footer */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 px-1 py-4">
          <p className="text-xs text-[#292923]/50">
            OPTR · Integrations
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292923]/60 transition hover:text-indigo-600"
          >
            Workspace overview
            <ArrowUpRight size={12} />
          </Link>
        </footer>
      </div>
    </main>
  );
}


import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { db } from "@/app/lib/db";
import { requireCurrentBusiness } from "@/app/lib/current-business";
import { GoogleCalendarSettings } from "./google-calendar-settings";

export const dynamic = "force-dynamic";

export default async function GoogleCalendarIntegrationPage() {
  const business = await requireCurrentBusiness();

  const connection = await db.googleCalendarConnection.findUnique({
    where: { businessId: business.id },
    select: {
      googleAccountEmail: true,
      calendarId: true,
      calendarName: true,
      timezone: true,
      isActive: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Google Calendar integration
              </h1>
              <p className="text-xs text-[#292923]/50">
                Calendar connection settings
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#292923]/65 shadow-sm">
            <CalendarDays size={14} className="text-emerald-600" />
            Calendar integration
          </div>
        </header>

        <section className="flex flex-col justify-between gap-4 pb-6 pt-8 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Integration configuration
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
              Connect your Google Calendar.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
              Allow your OPTR AI agent to access your Google Calendar so it
              can check availability and manage appointment events.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
                <CalendarDays size={17} />
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Google Calendar connection
                </h3>
                <p className="mt-0.5 text-xs text-[#292923]/60">
                  Connect a Google account to this business workspace
                </p>
              </div>
            </div>

            {connection?.isActive ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={13} />
                Connected
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#292923]/60">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Not connected
              </span>
            )}
          </div>

          <div className="p-4 sm:p-6">
            <GoogleCalendarSettings
              businessId={business.id}
              connection={connection}
            />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
          <div className="border-b border-slate-300 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold tracking-tight">
              What OPTR will be able to do
            </h3>
            <p className="mt-1 text-xs text-[#292923]/60">
              Permissions requested during Google authorization
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <p className="text-sm font-medium">View calendar availability</p>
              <p className="mt-1 text-xs leading-5 text-[#292923]/60">
                Check free and busy periods to help identify available
                appointment slots.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Read your calendar list</p>
              <p className="mt-1 text-xs leading-5 text-[#292923]/60">
                Retrieve the calendars associated with your Google account.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Manage calendar events</p>
              <p className="mt-1 text-xs leading-5 text-[#292923]/60">
                Create and manage events when the relevant OPTR functionality
                is configured.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs leading-5 text-[#292923]/65">
                Your Google credentials are encrypted and stored on the
                server. They are never sent to the browser.
              </p>
            </div>
          </div>
        </section>

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

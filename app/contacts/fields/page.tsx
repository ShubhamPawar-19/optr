
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Contact,
} from "lucide-react";

import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { getContactFields } from "@/app/features/contacts/queries/list-contact-fields";
import { ContactFieldsPage } from "@/app/features/contacts/components/contact-fields-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const fields = await getContactFields();

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#292923]">
      <div className="mx-auto max-w-[1680px] px-4 pb-10 sm:px-7 lg:px-10">
        {/* Workspace header */}
        <header className="sticky top-0 z-30 -mx-4 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-slate-300 bg-[#F5F7FB]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#292923]/50">
                <span>Workspace</span>
                <span className="text-[#292923]/30">/</span>
                <Link
                  href="/contacts"
                  className="transition hover:text-indigo-600"
                >
                  Contacts
                </Link>
                <span className="text-[#292923]/30">/</span>
                <span className="font-medium text-[#292923]/75">
                  Contact fields
                </span>
              </div>

              <h1 className="mt-1 text-lg font-semibold tracking-tight">
                Contact field management
              </h1>
            </div>
          </div>

          <Link
            href="/contacts"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-[#292923]/75 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
            Back to contacts
          </Link>
        </header>

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 pb-5 pt-7 sm:flex-row sm:items-end sm:pb-6 sm:pt-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              Contact configuration
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.045em] sm:text-[32px]">
              Define the information you track.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#292923]/60 sm:text-[15px]">
              Configure the information OPTR tracks for each contact and
              extracts from conversations.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pb-1 text-xs text-[#292923]/60">
            <CalendarClock size={15} className="text-emerald-600" />
            <span>Contact data configuration</span>
          </div>
        </section>

        {/* Contact fields workspace */}
        <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Contact size={17} />
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Contact fields
                </h3>
                <p className="mt-0.5 text-xs text-[#292923]/60">
                  Manage the attributes available for your contacts
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <ContactFieldsPage fields={fields} />
          </div>

          {/* Workspace footer */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 bg-white px-5 py-3.5 sm:px-6">
            <p className="text-xs text-[#292923]/50">
              OPTR · Contact management
            </p>

            <Link
              href="/contacts"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292923]/60 transition hover:text-indigo-600"
            >
              View contacts
              <ArrowUpRight size={12} />
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}

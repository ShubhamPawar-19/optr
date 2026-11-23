
"use client";

import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Link2,
  ShieldCheck,
  Unplug,
} from "lucide-react";

type Connection = {
  googleAccountEmail: string;
  calendarId: string | null;
  calendarName: string | null;
  timezone: string | null;
  isActive: boolean;
} | null;

export function GoogleCalendarSettings({
  businessId,
  connection,
}: {
  businessId: string;
  connection: Connection;
}) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleConnect() {
    if (isPending) return;

    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/integrations/google-calendar/connect",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessId }),
        },
      );

      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("authorizationUrl" in result) ||
        typeof result.authorizationUrl !== "string"
      ) {
        throw new Error("Unable to start Google authorization.");
      }

      const authorizationUrl = new URL(result.authorizationUrl);

      if (
        authorizationUrl.protocol !== "https:" ||
        authorizationUrl.hostname !== "accounts.google.com"
      ) {
        throw new Error("Invalid Google authorization URL.");
      }

      window.location.assign(authorizationUrl.toString());
    } catch {
      setMessage({
        type: "error",
        text: "Unable to connect Google Calendar. Please try again.",
      });
      setIsPending(false);
    }
  }

  const connected = Boolean(connection?.isActive);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        {connection ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#292923]/45">
                Google account
              </p>
              <p className="mt-1.5 break-all text-sm font-medium text-[#292923]/85">
                {connection.googleAccountEmail}
              </p>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#292923]/45">
                  Selected calendar
                </p>
                <p className="mt-1 text-sm text-[#292923]/75">
                  {connection.calendarName ?? "No calendar selected yet"}
                </p>
              </div>

              {connection.timezone && (
                <p className="mt-2 text-xs text-[#292923]/50">
                  Timezone: {connection.timezone}
                </p>
              )}
            </div>

            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                connected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {connected ? "Connected" : "Inactive"}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#292923]/45">
              <Unplug size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#292923]/75">
                No Google account connected
              </p>
              <p className="mt-1 text-xs leading-5 text-[#292923]/50">
                Connect your Google account to enable calendar integration
                for this workspace.
              </p>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="text-xs leading-5 text-[#292923]/60">
            Google authorization happens directly through Google. OPTR stores
            encrypted credentials on the server and does not expose them to
            your browser.
          </p>
        </div>

        {message && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="leading-5">{message.text}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={handleConnect}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3B3B34] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <Link2 size={15} />
                {connection ? "Reconnect Google account" : "Connect Google account"}
              </>
            )}
          </button>

          {connected && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 size={14} />
              Account authorized
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#292923]/50">
          <CalendarDays size={14} className="mt-0.5 shrink-0" />
          <p>
            After connecting, the next step will be selecting the calendar
            OPTR should use for availability checks and event management.
          </p>
        </div>
      </section>
    </div>
  );
}

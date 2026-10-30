
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Link2,
  LoaderCircle,
  MessageCircle,
  ShieldCheck,
  Unplug,
} from "lucide-react";

import {
  connectWhatsAppChannel,
  disconnectWhatsAppChannel,
} from "@/app/features/events/gateways/whatsapp/actions";

type Channel = {
  phoneNumberId: string;
  isActive: boolean;
  updatedAt: string;
};

export function WhatsAppSettings({
  channel,
}: {
  channel: Channel | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [displayPhoneNumber, setDisplayPhoneNumber] = useState<string | null>(
    null,
  );
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  function handleConnect(formData: FormData) {
    setMessage(null);
    setDisplayPhoneNumber(null);
    setVerifiedName(null);

    startTransition(async () => {
      const result = await connectWhatsAppChannel(formData);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setDisplayPhoneNumber(result.displayPhoneNumber ?? null);
        setVerifiedName(result.verifiedName ?? null);
        router.refresh();
      }
    });
  }

  function handleDisconnect() {
    if (!channel) return;

    const confirmed = window.confirm(
      "Disconnect this WhatsApp channel? OPTR will stop using it to send messages.",
    );

    if (!confirmed) return;

    setMessage(null);

    startTransition(async () => {
      const result = await disconnectWhatsAppChannel(channel.phoneNumberId);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        router.refresh();
      }
    });
  }

  const connected = Boolean(channel?.isActive);

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-300 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
              <MessageCircle size={17} />
            </div>

            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Connection status
              </h2>
              <p className="mt-0.5 text-xs text-[#292923]/60">
                WhatsApp Cloud API connection for this workspace
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              connected
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-[#292923]/60"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                connected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {channel ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#292923]/45">
                    Phone Number ID
                  </p>
                  <p className="mt-1.5 break-all font-mono text-sm font-medium text-[#292923]/85">
                    {channel.phoneNumberId}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 text-xs text-[#292923]/50">
                  <Clock3 size={13} />
                  <span>
                    Updated {new Date(channel.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#292923]/45">
                <Unplug size={15} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#292923]/75">
                  No WhatsApp number connected
                </p>
                <p className="mt-1 text-xs leading-5 text-[#292923]/50">
                  Connect a WhatsApp Business number to start receiving and
                  responding to inquiries through OPTR.
                </p>
              </div>
            </div>
          )}

          {displayPhoneNumber && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <p className="text-sm leading-6 text-emerald-800">
                Verified phone number:{" "}
                <span className="font-semibold">{displayPhoneNumber}</span>
                {verifiedName ? ` · ${verifiedName}` : ""}
              </p>
            </div>
          )}

          {channel && !channel.isActive && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p className="text-xs leading-5 text-amber-900/80">
                This channel is inactive. Connect it again to reactivate it.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Credentials form */}
      <section className="overflow-hidden rounded-xl border border-slate-300/80 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-300 px-5 py-4 sm:px-6">
          <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
            <KeyRound size={17} />
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight">
              {channel ? "Update credentials" : "Connect a WhatsApp number"}
            </h2>
            <p className="mt-0.5 text-xs text-[#292923]/60">
              Configure your Meta WhatsApp Cloud API credentials
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p className="text-xs leading-5 text-[#292923]/60">
              Your access token is encrypted on the server. It is never
              displayed again after saving.
            </p>
          </div>

          <form action={handleConnect} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="phoneNumberId"
                className="block text-sm font-medium text-[#292923]/80"
              >
                WhatsApp Phone Number ID
              </label>

              <input
                id="phoneNumberId"
                name="phoneNumberId"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                defaultValue={channel?.phoneNumberId ?? ""}
                placeholder="e.g. 123456789012345"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#292923] outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="accessToken"
                className="block text-sm font-medium text-[#292923]/80"
              >
                Meta access token
              </label>

              <input
                id="accessToken"
                name="accessToken"
                type="password"
                autoComplete="new-password"
                required
                minLength={20}
                placeholder="Paste your Meta access token"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#292923] outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="text-xs leading-5 text-[#292923]/50">
                Enter a new token to connect or replace the current token.
                The saved token cannot be retrieved from this form.
              </p>
            </div>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                )}
                <p className="leading-5">{message.text}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3B3B34] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Verifying with Meta...
                  </>
                ) : (
                  <>
                    <Link2 size={15} />
                    {connected ? "Save and reconnect" : "Verify and connect"}
                  </>
                )}
              </button>

              {channel?.isActive && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDisconnect}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#292923]/75 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Unplug size={15} />
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

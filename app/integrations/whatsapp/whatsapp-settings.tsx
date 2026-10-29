
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Connection status
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              WhatsApp Cloud API connection for this workspace.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              connected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                connected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>

        {channel && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Phone Number ID
            </p>
            <p className="mt-1 break-all font-mono text-sm text-slate-900">
              {channel.phoneNumberId}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Last updated: {new Date(channel.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        {displayPhoneNumber && (
          <p className="mt-3 text-sm text-slate-600">
            Verified phone number:{" "}
            <span className="font-medium text-slate-900">
              {displayPhoneNumber}
            </span>
            {verifiedName ? ` · ${verifiedName}` : ""}
          </p>
        )}

        {channel && !channel.isActive && (
          <p className="mt-3 text-sm text-amber-700">
            This channel is inactive. Connect it again to reactivate it.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-950">
          {channel ? "Update credentials" : "Connect a WhatsApp number"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Your access token is encrypted on the server. It is never displayed
          again after saving.
        </p>

        <form action={handleConnect} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="phoneNumberId"
              className="block text-sm font-medium text-slate-800"
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
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 text-black"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="accessToken"
              className="block text-sm font-medium text-slate-800"
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
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition text-black focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <p className="text-xs leading-5 text-slate-500">
              Enter a new token to connect or replace the current token. The
              saved token cannot be retrieved from this form.
            </p>
          </div>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Verifying with Meta..."
                : connected
                  ? "Save and reconnect"
                  : "Verify and connect"}
            </button>

            {channel?.isActive && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleDisconnect}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Disconnect
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

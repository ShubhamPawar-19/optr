
"use client";

import { useState, useTransition } from "react";
import {
    Activity,
    Check,
    ChevronDown,
    Globe,
    Loader2,
    Phone,
    Plus,
    Radio,
    ShieldCheck,
    ToggleLeft,
    ToggleRight,
    X,
} from "lucide-react";

import {
    createVoiceChannel,
    setVoiceChannelActive,
} from "@/app/features/voice/actions";

type VoiceChannel = {
    id: string;
    provider: string;
    providerAgentId: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    agent: {
        id: string;
        name: string;
        isActive: boolean;
    };
};

type Agent = {
    id: string;
    name: string;
};

type Props = {
    channels: VoiceChannel[];
    agents: Agent[];
};

type CallType = "WEB" | "PHONE";

export function VoiceSettings({ channels, agents }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [callType, setCallType] = useState<CallType>("WEB");
    const [providerAgentId, setProviderAgentId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();

    function resetForm() {
        setShowForm(false);
        setCallType("WEB");
        setProviderAgentId("");
        setPhoneNumber("");
        setAgentId(agents[0]?.id ?? "");
        setError("");
    }

    function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.set("callType", callType);
        formData.set("providerAgentId", providerAgentId);
        formData.set("agentId", agentId);

        if (callType === "PHONE") {
            formData.set("phoneNumber", phoneNumber);
        }

        startTransition(async () => {
            try {
                const result = await createVoiceChannel(formData);

                if (!result.success) {
                    setError(result.error ?? "Unable to create voice channel.");
                    return;
                }

                setSuccess("Voice channel configured successfully.");
                resetForm();
                window.location.reload();
            } catch {
                setError("Something went wrong while configuring the channel.");
            }
        });
    }

    function handleToggle(channelId: string, active: boolean) {
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.set("channelId", channelId);
        formData.set("active", String(active));

        startTransition(async () => {
            try {
                const result = await setVoiceChannelActive(formData);

                if (!result.success) {
                    setError(result.error ?? "Unable to update voice channel.");
                    return;
                }

                setSuccess(
                    active
                        ? "Voice channel activated."
                        : "Voice channel deactivated.",
                );
                window.location.reload();
            } catch {
                setError("Unable to update this voice channel.");
            }
        });
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-[#292923]">
                                <Radio size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-[#292923]">
                                    Retell voice
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Connect Retell voice agents to your OPTR workspace.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setShowForm((current) => !current);
                        }}
                        disabled={agents.length === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-4 text-sm font-medium text-white transition hover:bg-[#3b3b34] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={16} />
                        Add voice channel
                    </button>
                </div>

                {agents.length === 0 && (
                    <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Create and activate an AI agent before configuring a voice channel.
                    </p>
                )}

                {error && (
                    <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {success && (
                    <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </p>
                )}
            </section>

            {showForm && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-[#292923]">
                                Configure voice channel
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Add the Retell agent you want OPTR to handle.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#292923]"
                            aria-label="Close form"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#292923]">
                                Channel type
                            </label>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setCallType("WEB")}
                                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                                        callType === "WEB"
                                            ? "border-[#292923] bg-slate-50 ring-1 ring-[#292923]"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <Globe size={20} className="mt-0.5 text-[#292923]" />
                                    <span>
                                        <span className="block text-sm font-semibold text-[#292923]">
                                            Web Call
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            Browser-based voice conversations.
                                        </span>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCallType("PHONE")}
                                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                                        callType === "PHONE"
                                            ? "border-[#292923] bg-slate-50 ring-1 ring-[#292923]"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <Phone size={20} className="mt-0.5 text-[#292923]" />
                                    <span>
                                        <span className="block text-sm font-semibold text-[#292923]">
                                            Phone Call
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            Incoming calls to a Retell phone number.
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="retell-agent-id" className="mb-2 block text-sm font-medium text-[#292923]">
                                Retell Agent ID
                            </label>
                            <input
                                id="retell-agent-id"
                                value={providerAgentId}
                                onChange={(event) => setProviderAgentId(event.target.value)}
                                placeholder="agent_xxxxxxxxxxxxxxxxx"
                                required
                                maxLength={200}
                                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#292923] focus:ring-2 focus:ring-slate-200"
                            />
                            <p className="mt-1.5 text-xs text-slate-500">
                                Find this in your Retell dashboard under Agents.
                            </p>
                        </div>

                        {callType === "PHONE" && (
                            <div>
                                <label htmlFor="retell-phone-number" className="mb-2 block text-sm font-medium text-[#292923]">
                                    Retell phone number
                                </label>
                                <input
                                    id="retell-phone-number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(event) => setPhoneNumber(event.target.value)}
                                    placeholder="+971XXXXXXXXX"
                                    required
                                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#292923] focus:ring-2 focus:ring-slate-200"
                                />
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Use international format, including the country code.
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="optr-agent" className="mb-2 block text-sm font-medium text-[#292923]">
                                Assign OPTR AI agent
                            </label>
                            <select
                                id="optr-agent"
                                value={agentId}
                                onChange={(event) => setAgentId(event.target.value)}
                                required
                                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#292923] focus:ring-2 focus:ring-slate-200"
                            >
                                {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-slate-500">
                                OPTR uses this agent's instructions, business context, and tools.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isPending}
                                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isPending || !providerAgentId.trim() || !agentId}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#292923] px-5 text-sm font-medium text-white transition hover:bg-[#3b3b34] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save voice channel"
                                )}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-[#292923]">
                            Configured channels
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {channels.length} voice channel{channels.length === 1 ? "" : "s"} configured
                        </p>
                    </div>
                </div>

                {channels.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <Activity size={22} />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-[#292923]">
                            No voice channels configured
                        </h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                            Add a Retell Web Call or Phone Call channel to connect your OPTR AI agent.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {channels.map((channel) => {
                            const isWeb = !channel.phoneNumber;

                            return (
                                <article
                                    key={channel.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#292923]">
                                                {isWeb ? <Globe size={20} /> : <Phone size={20} />}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-sm font-semibold text-[#292923]">
                                                        {isWeb ? "Retell Web Call" : "Retell Phone Call"}
                                                    </h3>

                                                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                        channel.isActive
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}>
                                                        {channel.isActive ? "Active" : "Inactive"}
                                                    </span>

                                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                                        Configured
                                                    </span>
                                                </div>

                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {channel.agent.name}
                                                </p>

                                                <p className="mt-2 break-all font-mono text-xs text-slate-500">
                                                    {channel.providerAgentId}
                                                </p>

                                                {channel.phoneNumber && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {channel.phoneNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleToggle(channel.id, !channel.isActive)}
                                            disabled={isPending}
                                            className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition disabled:opacity-50 ${
                                                channel.isActive
                                                    ? "border-slate-300 text-slate-600 hover:bg-slate-50"
                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            }`}
                                        >
                                            {channel.isActive ? (
                                                <ToggleRight size={16} />
                                            ) : (
                                                <ToggleLeft size={16} />
                                            )}
                                            {channel.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>

                                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                                        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-slate-500" />
                                        <p className="text-xs leading-5 text-slate-500">
                                            Configuration saved in OPTR. Retell connectivity and webhook delivery have not been verified here.
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

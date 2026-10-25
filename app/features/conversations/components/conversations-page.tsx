"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCheck,
  MessageCircle,
  MessagesSquare,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { SidebarToggle } from "@/app/components/sidebar-toggle";

type Conversation = {
  id: string;
  agentId: string;
  channel: string;
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
  _count: {
    messages: number;
  };
};

function normalizeRole(role: string) {
  return role.trim().toLowerCase();
}

function isAssistantMessage(role: string) {
  const normalized = normalizeRole(role);
  return ["assistant", "agent", "ai", "bot"].includes(normalized);
}

function isUserMessage(role: string) {
  const normalized = normalizeRole(role);
  return ["user", "client", "customer", "human"].includes(normalized);
}

function formatDate(date: Date) {
  const value = new Date(date);
  const today = new Date();

  if (value.toDateString() === today.toDateString()) {
    return value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return value.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getContactName(conversation: Conversation) {
  return (
    conversation.contact?.name?.trim() ||
    conversation.contact?.phone ||
    conversation.externalId
  );
}

function getInitial(conversation: Conversation) {
  return getContactName(conversation).charAt(0).toUpperCase() || "?";
}

function getLatestMessage(conversation: Conversation) {
  return conversation.messages[conversation.messages.length - 1];
}

function getMessagePreview(message: Conversation["messages"][number] | undefined) {
  if (!message) return "No messages yet";

  const prefix = isAssistantMessage(message.role)
    ? "Agent: "
    : isUserMessage(message.role)
      ? "Client: "
      : "";

  return `${prefix}${message.content}`;
}

export function ConversationsPage({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const contact = conversation.contact;

      return [
        contact?.name,
        contact?.phone,
        contact?.email,
        conversation.externalId,
        conversation.channel,
        ...conversation.messages.map((message) => message.content),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [conversations, search]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    null;

  return (
    <main className="h-[100dvh] min-h-[480px] overflow-hidden bg-slate-50 p-0 md:p-4 lg:p-5">
      <section className="flex h-full min-h-0 overflow-hidden border-y border-slate-200 bg-white md:rounded-2xl md:border">
        {/* Conversation list */}
        <aside
          className={`${
            showChatOnMobile ? "hidden" : "flex"
          } w-full shrink-0 flex-col bg-white md:flex md:w-[320px] lg:w-[360px] xl:w-[390px]`}
        >
          <div className="border-b border-slate-100 px-4 pb-4 pt-4 sm:px-5">
            <div className="mb-5 flex items-center gap-3">
              <SidebarToggle />
              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight text-slate-900">
                  Conversations
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Customer messages and AI replies
                </p>
              </div>
              <span className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <MessagesSquare className="size-4" />
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages or contacts"
                aria-label="Search conversations"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                All chats
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
                {filteredConversations.length}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100">
                  <MessageCircle className="size-5 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-800">
                  {conversations.length === 0
                    ? "No conversations yet"
                    : "No results found"}
                </p>
                <p className="mt-1 max-w-56 text-xs leading-5 text-slate-500">
                  {conversations.length === 0
                    ? "Customer conversations will appear here when messages arrive."
                    : "Try searching for a different name, phone number, or message."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const latestMessage = getLatestMessage(conversation);
                const isSelected = conversation.id === selectedId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(conversation.id);
                      setShowChatOnMobile(true);
                    }}
                    className={`group relative flex w-full items-center gap-3 px-4 py-4 text-left transition-colors ${
                      isSelected
                        ? "bg-slate-50"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-slate-900" />
                    )}

                    <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/70">
                      {getInitial(conversation)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            isSelected
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-800"
                          }`}
                        >
                          {getContactName(conversation)}
                        </p>
                        <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs leading-5 text-slate-500">
                        {getMessagePreview(latestMessage)}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-500">
                          {conversation.channel}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {conversation._count.messages}{" "}
                          {conversation._count.messages === 1
                            ? "message"
                            : "messages"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Selected conversation */}
        <section
          className={`${
            showChatOnMobile ? "flex" : "hidden md:flex"
          } min-w-0 flex-1 flex-col border-l border-slate-100 bg-white`}
        >
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <header className="z-10 flex min-h-[76px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setShowChatOnMobile(false)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-5" />
                </button>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                  {getInitial(selectedConversation)}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-slate-900">
                    {getContactName(selectedConversation)}
                  </h2>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {selectedConversation.contact?.phone ||
                      selectedConversation.externalId}
                    {selectedConversation.contact?.email
                      ? ` · ${selectedConversation.contact.email}`
                      : ""}
                  </p>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:flex">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium capitalize text-slate-600">
                    {selectedConversation.channel}
                  </span>
                </div>
              </header>

              {/* Message history */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-3 py-6 sm:px-6 lg:px-10">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                  <div className="mb-3 flex items-center justify-center">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm">
                      Conversation history
                    </span>
                  </div>

                  {selectedConversation.messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <MessageCircle className="size-6 text-slate-400" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-800">
                        No messages yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Messages will appear here when the conversation starts.
                      </p>
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => {
                      const assistant = isAssistantMessage(message.role);
                      const user = isUserMessage(message.role);

                      // Assistant messages are right-aligned.
                      // User/client messages are left-aligned.
                      // Unknown roles remain left-aligned rather than being
                      // incorrectly displayed as assistant responses.
                      const alignRight = assistant;

                      return (
                        <div
                          key={message.id}
                          className={`flex w-full ${
                            alignRight ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex min-w-0 max-w-[92%] items-end gap-2 sm:max-w-[82%] ${
                              alignRight ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div
                              className={`mb-1 hidden size-7 shrink-0 items-center justify-center rounded-full sm:flex ${
                                assistant
                                  ? "bg-slate-800 text-white"
                                  : "border border-slate-200 bg-white text-slate-500"
                              }`}
                              aria-label={assistant ? "AI assistant" : "Customer"}
                            >
                              {assistant ? (
                                <Bot className="size-3.5" />
                              ) : (
                                <UserRound className="size-3.5" />
                              )}
                            </div>

                            <div
                              className={`min-w-0 rounded-2xl px-4 py-3 shadow-sm ${
                                assistant
                                  ? "rounded-tr-md bg-slate-900 text-white"
                                  : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-[13px] leading-6">
                                {message.content}
                              </p>

                              <div
                                className={`mt-2 flex items-center justify-end gap-1.5 ${
                                  assistant
                                    ? "text-slate-400"
                                    : "text-slate-400"
                                }`}
                              >
                                <span className="text-[10px] tabular-nums">
                                  {formatTime(message.createdAt)}
                                </span>
                                {assistant && (
                                  <CheckCheck
                                    className="size-3.5 text-emerald-400"
                                    aria-label="Assistant message"
                                  />
                                )}
                                {!assistant && !user && (
                                  <span className="text-[10px]">
                                    {message.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Read-only footer */}
              <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-slate-200 bg-white px-4 py-4">
                <MessagesSquare className="size-4 text-slate-400" />
                <p className="text-xs text-slate-500">
                  Conversation history is read-only
                </p>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <MessagesSquare className="size-7 text-slate-400" />
              </div>
              <h2 className="mt-5 text-base font-semibold text-slate-900">
                Your conversations
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Select a conversation from the sidebar to view its complete message history.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

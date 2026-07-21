"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { apiPost } from "@/lib/api";
import type { ChatResult } from "@/lib/types";
import { useUi } from "@/store/ui";
import { SandboxBadge } from "./SandboxBadge";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

// Pre-written, short suggestion chips (credit discipline).
const SUGGESTIONS = [
  "What do I need for the medical certificate?",
  "How much will everything cost in total?",
  "What happens after my student permit?",
];

interface ChatDrawerProps {
  activeNodeId: string | undefined;
}

/**
 * Stateless per message: only { prompt, node_id } is ever sent. The visible
 * message list is browser-side display only and is NEVER sent to the backend.
 */
export function ChatDrawer({ activeNodeId }: ChatDrawerProps) {
  const chatOpen = useUi((s) => s.chatOpen);
  const setChatOpen = useUi((s) => s.setChatOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSimulated, setLastSimulated] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);
    const res = await apiPost<ChatResult>("/ai/chat", {
      prompt: trimmed,
      ...(activeNodeId ? { node_id: activeNodeId } : {}),
    });
    setLoading(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Assistant is unavailable — your roadmap still works.",
          isError: true,
        },
      ]);
      return;
    }
    setLastSimulated(res.data.simulated);
    setMessages((prev) => [...prev, { role: "assistant", text: res.data.text }]);
  }

  if (!chatOpen) {
    return (
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        aria-label="Open assistant chat"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:bg-blue-800"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h8M8 14h5m-9.7 5.6 1.2-3.2A8 8 0 1 1 8 20.2l-4.5 1z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex h-[70vh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:h-[32rem] sm:w-96 sm:rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">GabAI Assistant</span>
          {lastSimulated && <SandboxBadge />}
        </div>
        <button
          type="button"
          onClick={() => setChatOpen(false)}
          aria-label="Close chat"
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Ask about any step on your roadmap. Each question is answered fresh — no chat
            history is stored.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-brand text-white"
                  : msg.isError
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-800"
              }`}
            >
              {msg.role === "assistant" && !msg.isError ? (
                <div className="prose-sm [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="Ask a question…"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={loading || input.trim() === ""}
            className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

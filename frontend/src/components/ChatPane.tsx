"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Car, CreditCard, Heart, Landmark, Loader2, Plane, Send, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SandboxBadge } from "./SandboxBadge";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  simulated?: boolean;
  isError?: boolean;
}

export interface Faq {
  id: string;
  icon: LucideIcon;
  label: string;
  kind: "route" | "ask";
  ask: string;
}

/** Shortcut chips — the route one reveals the journey panel; the rest are
 *  real questions sent to the AI copilot. */
export const FAQS: Faq[] = [
  {
    id: "license", icon: Car, label: "How to get a driver's license", kind: "route",
    ask: "How do I get a driver's license?",
  },
  {
    id: "marriage", icon: Heart, label: "Process for a marriage certificate", kind: "ask",
    ask: "What's the process for getting a marriage certificate?",
  },
  {
    id: "sss", icon: Landmark, label: "How to get an SSS number", kind: "ask",
    ask: "How do I get an SSS number?",
  },
  {
    id: "passport", icon: Plane, label: "First-time passport application", kind: "ask",
    ask: "How do I apply for a passport for the first time?",
  },
  {
    id: "natid", icon: CreditCard, label: "Replace a lost National ID", kind: "ask",
    ask: "How do I replace a lost National ID?",
  },
];

interface ChatPaneProps {
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  onFaq: (faq: Faq) => void;
}

/** Right pane: copilot chat. Each send is stateless — only the current prompt
 *  (plus active node id) goes to the backend; this visible list never does. */
export function ChatPane({ messages, busy, onSend, onFaq }: ChatPaneProps) {
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, busy]);

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    onSend(text);
  }

  return (
    <section className="chat-pane">
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => (
            <div
              className="msg"
              key={i}
              style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", display: "flex", gap: 10 }}
            >
              {m.role === "assistant" && (
                <span style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "50%", background: "#EAF0FB", display: "grid", placeItems: "center", marginTop: 2 }}>
                  <Sparkles size={14} color="var(--route)" />
                </span>
              )}
              <div>
                <div
                  style={{
                    background: m.role === "user" ? "var(--route)" : m.isError ? "#FDECEC" : "#fff",
                    border: m.role === "user" ? "none" : "1px solid var(--line)",
                    color: m.role === "user" ? "#fff" : m.isError ? "#B4232C" : "var(--ink)",
                    padding: "11px 14px", borderRadius: 14, fontSize: 14.5,
                    borderTopRightRadius: m.role === "user" ? 4 : 14,
                    borderTopLeftRadius: m.role === "user" ? 14 : 4,
                  }}
                >
                  {m.role === "assistant" && !m.isError ? (
                    <div className="chat-md">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
                  )}
                </div>
                {m.simulated && (
                  <div style={{ marginTop: 4 }}>
                    <SandboxBadge />
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="msg" style={{ alignSelf: "flex-start", color: "var(--muted)", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#EAF0FB", display: "grid", placeItems: "center" }}>
                <Sparkles size={14} color="var(--route)" />
              </span>
              <Loader2 size={14} className="spin" /> Thinking…
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: "0 0 auto", borderTop: "1px solid var(--line)", background: "#fff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "10px 20px 14px" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {FAQS.map((f) => (
              <button className="mini-chip" key={f.id} onClick={() => onFaq(f)} disabled={busy}>
                <f.icon size={13} color="var(--route)" /> {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              maxLength={500}
              placeholder="Ask anything about government services…"
              style={{ flex: 1, minWidth: 0, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, font: "inherit", fontSize: 14.5 }}
            />
            <button className="btn btn-primary" onClick={submit} disabled={busy || !input.trim()} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
            Answers are informational; LTO submissions are simulated and labelled. Powered by Claude.
          </div>
        </div>
      </div>
    </section>
  );
}

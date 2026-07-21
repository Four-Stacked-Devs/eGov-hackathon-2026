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
  kind: "route" | "answer";
  ask: string;
  answer?: string;
}

/**
 * FAQ shortcuts answer locally in the browser — no AI credits are spent.
 * Only free-typed questions reach the (stateless) /ai/chat backend.
 */
export const FAQS: Faq[] = [
  {
    id: "license", icon: Car, label: "How to get a driver's license", kind: "route",
    ask: "How do I get a driver's license?",
  },
  {
    id: "marriage", icon: Heart, label: "Process for a marriage certificate", kind: "answer",
    ask: "What's the process for getting a marriage certificate?",
    answer:
      "Here's the short version for a PSA marriage certificate:\n\n1. Marriage license first — apply at the Local Civil Registrar (LCR) where either of you resides: PSA birth certificates, CENOMAR, valid IDs, and (if 18–25) parental consent/advice. There's a 10-day posting period.\n2. Get married within 120 days of the license issue.\n3. The solemnizing officer files the certificate with the LCR, which endorses it to the PSA.\n4. After ~1–3 months you can request the PSA copy online (PSAHelpline or PSASerbilis) or at any PSA outlet — ₱155 per copy (walk-in).\n\nWhen this route goes interactive it will appear on the left panel like the driver's licence one — pre-filled with your verified details.",
  },
  {
    id: "sss", icon: Landmark, label: "How to get an SSS number", kind: "answer",
    ask: "How do I get an SSS number?",
    answer:
      "Getting your SSS number is fully online:\n\n1. Go to the SSS website → \"No SS Number yet? Apply online.\"\n2. Fill in your details (they'd auto-fill from your National ID here — Once-Only Policy).\n3. Check your email for the link, complete the form, and upload your supporting document (PSA birth certificate or ID).\n4. You'll receive your SS number instantly by email; print the transaction slip.\n5. To use SSS services, register on My.SSS and start posting contributions.\n\nIt's free — no fees for number issuance.",
  },
  {
    id: "passport", icon: Plane, label: "First-time passport application", kind: "answer",
    ask: "How do I apply for a passport for the first time?",
    answer:
      "First-time Philippine passport, in brief:\n\n1. Book an appointment at passport.gov.ph (slots open 9 PM daily).\n2. Pay the fee online or at partner outlets — ₱950 (regular, 12 working days) or ₱1,200 (expedited, 6).\n3. Show up with your PSA birth certificate and one valid government ID — your PhilID / National ID counts.\n4. Biometrics + photo are captured on-site.\n5. Claim it or have it delivered.\n\nWith your verified identity, the application form would be pre-filled here. The driver's licence route on the left is the fully interactive demo.",
  },
  {
    id: "natid", icon: CreditCard, label: "Replace a lost National ID", kind: "answer",
    ask: "How do I replace a lost National ID?",
    answer:
      "To replace a lost PhilID:\n\n1. Report the loss and execute a notarized Affidavit of Loss.\n2. Book a replacement at a PhilSys registration center (or PHLPost) — bring the affidavit and a supporting ID.\n3. Pay the ₱100 replacement fee (first issuance was free; loss replacement isn't).\n4. Biometrics are re-verified against your PhilSys record — the same eVerify 1:1 match this app uses to log you in.\n5. Meanwhile, your Digital National ID on the eGovPH app remains usable.\n\nTip: your ePhilID (printable) can also serve as valid ID while waiting.",
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
            Answers are informational; LTO submissions are simulated and labelled. Powered by eGov AI.
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import type {
  ChatResult, RoadmapData, RoadmapNode, SubmitResult, UserProfile,
} from "@/lib/types";
import { ChatPane, type ChatMessage, type Faq } from "@/components/ChatPane";
import { Logo } from "@/components/Logo";
import { NodeModal } from "@/components/NodeModal";
import { RoutePane } from "@/components/RoutePane";
import { WorkspaceSkeleton } from "@/components/WorkspaceSkeleton";

function cap(s: string): string {
  return s ? s[0] + s.slice(1).toLowerCase() : s;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [routeShown, setRouteShown] = useState(false);
  const [activeNode, setActiveNode] = useState<RoadmapNode | null>(null);
  const startedRef = useRef(false);

  const push = useCallback((...msgs: ChatMessage[]) => {
    setMessages((m) => [...m, ...msgs]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const me = await apiGet<{ user: UserProfile }>("/me");
    if (!me.ok) {
      router.replace("/");
      return;
    }
    setUser(me.data.user);
    const rm = await apiGet<RoadmapData>("/roadmap");
    if (!rm.ok) {
      setError(rm.error);
      setLoading(false);
      return;
    }
    setRoadmap(rm.data);
    // Returning users with progress see their route immediately.
    setRouteShown(rm.data.nodes.some((n) => n.status === "done"));
    setMessages([
      {
        role: "assistant",
        content: `Hi ${cap(me.data.user.first_name)}! Your identity is verified, so I can pre-fill any government form for you. Ask me anything — or tap a shortcut below. When you pick a goal, your step-by-step route appears on the left.`,
      },
    ]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void load();
  }, [load]);

  const firstName = user ? cap(user.first_name) : "";

  function startRoute(withUserMsg: ChatMessage | null) {
    if (routeShown) {
      const again: ChatMessage = {
        role: "assistant",
        content: "Your driver's-licence route is live on the left panel — tap the highlighted station to continue. 👈",
      };
      push(...(withUserMsg ? [withUserMsg, again] : [again]));
      return;
    }
    setRouteShown(true);
    const intro: ChatMessage = {
      role: "assistant",
      content: `Great goal, ${firstName}! I've mapped your journey to a Non-Professional Driver's Licence — see the route panel on the left. Six stations; tap each to see what's needed and file it in place. Your verified ID fills the forms for you.`,
    };
    push(...(withUserMsg ? [withUserMsg, intro] : [intro]));
  }

  function handleFaq(faq: Faq) {
    if (busy) return;
    if (faq.kind === "route") {
      startRoute({ role: "user", content: faq.ask });
    } else {
      void send(faq.ask);
    }
  }

  async function send(text: string) {
    push({ role: "user", content: text });
    setBusy(true);
    // Stateless per message — only the prompt and current node id are sent.
    const activeNodeId = roadmap?.nodes.find((n) => n.status === "active")?.id;
    const res = await apiPost<ChatResult>("/ai/chat", {
      prompt: text,
      ...(activeNodeId ? { node_id: activeNodeId } : {}),
    });
    setBusy(false);
    if (!res.ok) {
      const detail = [res.error, res.hint].filter(Boolean).join(" ");
      push({
        role: "assistant",
        content: detail || "Assistant is unavailable — your roadmap still works.",
        isError: true,
      });
      return;
    }
    push({ role: "assistant", content: res.data.text, simulated: res.data.simulated });
  }

  function handleComplete(result: SubmitResult) {
    setRoadmap((prev) =>
      prev
        ? {
            ...prev,
            nodes: prev.nodes.map((n) =>
              n.id === result.node_id
                ? { ...n, status: "done", reference_no: result.reference_no }
                : n.id === result.next_node_id
                  ? { ...n, status: "active" }
                  : n
            ),
          }
        : prev
    );
    setActiveNode(null);
    const node = roadmap?.nodes.find((n) => n.id === result.node_id);
    const next = result.next_node_id
      ? roadmap?.nodes.find((n) => n.id === result.next_node_id)
      : undefined;
    const smsNote = user?.mobile_number
      ? ` A confirmation SMS was sent to ${user.mobile_number} via eMessage.`
      : "";
    push({
      role: "assistant",
      content: next
        ? `✅ "${node?.title ?? result.node_id}" is done — your pre-filled application ${result.reference_no} was filed with the simulated LTO sandbox.${smsNote} Next stop unlocked on the left: "${next.title}".`
        : `🎉 That was the last station — route complete! You've gone from zero to a Non-Professional Driver's Licence.${smsNote} Ask me about any other government service next.`,
      simulated: true,
    });
  }

  if (loading) {
    return <WorkspaceSkeleton />;
  }

  if (error || !roadmap || !user) {
    return (
      <div className="haviflow" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="card" style={{ maxWidth: 380, width: "100%", padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>{error ?? "Something went wrong."}</p>
          <button className="btn btn-primary" style={{ justifyContent: "center", width: "100%" }} onClick={() => void load()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initials = (user.first_name[0] ?? "") + (user.last_name[0] ?? "");

  return (
    <div className="haviflow" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line)", background: "#fff", flex: "0 0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
          <Logo />
          <span className="chip">
            <span className="avatar">{initials}</span>
            {cap(user.first_name)} {cap(user.last_name)}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--ok)", fontSize: 11.5, fontWeight: 700 }}>
              <BadgeCheck size={13} /> Verified
            </span>
          </span>
        </div>
      </header>

      <div className="split">
        <aside className="route-pane">
          <RoutePane
            roadmap={roadmap}
            routeShown={routeShown}
            onOpen={setActiveNode}
            onStartRoute={() => startRoute(null)}
          />
        </aside>
        <ChatPane messages={messages} busy={busy} onSend={(t) => void send(t)} onFaq={handleFaq} />
      </div>

      {activeNode && (
        <NodeModal
          node={activeNode}
          user={user}
          onClose={() => setActiveNode(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

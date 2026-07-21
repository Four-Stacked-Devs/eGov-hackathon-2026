"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { RoadmapData, RoadmapNode, SubmitResult, UserProfile } from "@/lib/types";
import { ChatDrawer } from "@/components/ChatDrawer";
import { NodeModal } from "@/components/NodeModal";
import { Roadmap } from "@/components/Roadmap";
import { SummaryBar } from "@/components/SummaryBar";
import { Toast } from "@/components/Toast";
import { useUi } from "@/store/ui";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 w-44 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const openNodeId = useUi((s) => s.openNodeId);
  const openNode = useUi((s) => s.openNode);
  const closeNode = useUi((s) => s.closeNode);
  const showToast = useUi((s) => s.showToast);
  const startedRef = useRef(false);

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
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void load();
  }, [load]);

  function handleSubmitted(result: SubmitResult) {
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
    showToast(`Submitted! Ref ${result.reference_no} — SMS confirmation sent 📱`);
    closeNode();
  }

  const openedNode: RoadmapNode | undefined = roadmap?.nodes.find((n) => n.id === openNodeId);
  const activeNodeId = roadmap?.nodes.find((n) => n.status === "active")?.id;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 pb-24">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {roadmap?.title ?? "Driver's License Roadmap"}
          </h1>
          <p className="text-sm text-slate-500">
            {roadmap?.subtitle ?? "Student Permit to Non-Professional License"}
          </p>
        </div>
        {user && (
          <p className="text-sm font-medium text-slate-600">
            👤 {user.first_name} {user.last_name}
          </p>
        )}
      </header>

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-700">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && roadmap && user && (
        <div className="space-y-8">
          <SummaryBar summary={roadmap.summary} />
          <Roadmap nodes={roadmap.nodes} onNodeClick={(node) => openNode(node.id)} />
        </div>
      )}

      {openedNode && user && (
        <NodeModal
          node={openedNode}
          user={user}
          onClose={closeNode}
          onSubmitted={handleSubmitted}
        />
      )}

      <ChatDrawer activeNodeId={activeNodeId} />
      <Toast />
    </main>
  );
}

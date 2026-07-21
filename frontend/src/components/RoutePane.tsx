"use client";

import { Car, Check, ChevronRight, Lock, MapPin } from "lucide-react";
import type { RoadmapData, RoadmapNode } from "@/lib/types";

interface RoutePaneProps {
  roadmap: RoadmapData;
  routeShown: boolean;
  onOpen: (node: RoadmapNode) => void;
  onStartRoute: () => void;
}

function feeLabel(fee: number): string {
  return fee > 0 ? `₱${fee.toLocaleString("en-PH")}` : "Free";
}

/** Left pane: the six real roadmap nodes rendered as route stations. */
export function RoutePane({ roadmap, routeShown, onOpen, onStartRoute }: RoutePaneProps) {
  const nodes = roadmap.nodes;
  const doneCount = nodes.filter((n) => n.status === "done").length;

  if (!routeShown) {
    return (
      <div
        style={{
          padding: 22, display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", justifyContent: "center", minHeight: "100%",
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "#EAF0FB", display: "grid", placeItems: "center", marginBottom: 14 }}>
          <MapPin size={24} color="var(--route)" />
        </div>
        <b style={{ fontSize: 15.5 }}>No active route yet</b>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 260, margin: "6px 0 16px" }}>
          Ask about a goal — like getting a driver&rsquo;s licence — and your step-by-step
          route will appear here.
        </p>
        <button className="btn btn-primary" onClick={onStartRoute}>
          <Car size={16} /> Start: Driver&rsquo;s licence
        </button>
        <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--muted)" }}>
          More routes (marriage, SSS, passport…) coming soon — demo has one live route.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "18px 18px 24px" }}>
      <div className="eyebrow">Your route</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "4px 0 2px" }}>
        <b style={{ fontSize: 16 }}>{roadmap.subtitle}</b>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          {doneCount}/{nodes.length}
        </span>
      </div>
      <div style={{ height: 6, background: "var(--line)", borderRadius: 999, overflow: "hidden", margin: "8px 0 6px" }}>
        <div
          style={{
            height: "100%", width: `${(doneCount / nodes.length) * 100}%`,
            background: "var(--sun)", borderRadius: 999, transition: "width .4s",
          }}
        />
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 4px" }}>
        Total: ₱{roadmap.summary.total_fee_php.toLocaleString("en-PH")} · est.{" "}
        {roadmap.summary.total_weeks_estimate} weeks · {roadmap.summary.office_visits} office visits
      </p>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
        Tap a station to see what to do — and file it in place.
      </p>

      {nodes.map((n, i) => {
        const isDone = n.status === "done";
        const locked = n.status === "locked";
        const current = n.status === "active";
        const cls = "station " + (isDone ? "done" : locked ? "locked" : current ? "current" : "");
        return (
          <div className={cls} key={n.id}>
            <div
              className="station-row"
              onClick={() => !locked && onOpen(n)}
              role="button"
              tabIndex={locked ? -1 : 0}
              title={locked ? "Complete previous steps first" : n.title}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !locked) onOpen(n);
              }}
            >
              {i < nodes.length - 1 && <span className="station-line" />}
              <div className="station-dot">
                {isDone ? <Check size={16} /> : locked ? <Lock size={13} /> : (
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{n.order}</span>
                )}
              </div>
              <div className="station-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
                        color: current ? "var(--route)" : "var(--muted)",
                      }}
                    >
                      Step {n.order}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</div>
                  </div>
                  {!locked && <ChevronRight size={16} color="var(--muted)" />}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                  {n.form.length > 0 ? "Form auto-fills · " : "Checkpoint · "}Fee {feeLabel(n.fee_php)}
                  {n.reference_no ? ` · ${n.reference_no}` : ""}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

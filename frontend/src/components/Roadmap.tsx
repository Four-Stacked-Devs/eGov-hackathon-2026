"use client";

import { Fragment } from "react";
import type { RoadmapNode } from "@/lib/types";

interface RoadmapProps {
  nodes: RoadmapNode[];
  onNodeClick: (node: RoadmapNode) => void;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

function StatusIcon({ status }: { status: RoadmapNode["status"] }) {
  if (status === "done") {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.8a1 1 0 0 1 1.4 0Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (status === "locked") {
    return (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return <span className="text-sm font-bold" aria-hidden>→</span>;
}

function NodeCard({
  node,
  onClick,
}: {
  node: RoadmapNode;
  onClick: (node: RoadmapNode) => void;
}) {
  const clickable = node.status !== "locked";
  const circleStyles =
    node.status === "done"
      ? "bg-success text-white"
      : node.status === "active"
        ? "bg-brand text-white"
        : "bg-slate-200 text-locked";
  return (
    <button
      type="button"
      onClick={clickable ? () => onClick(node) : undefined}
      disabled={!clickable}
      title={node.status === "locked" ? "Complete previous steps first" : node.title}
      className={`flex w-full max-w-[11rem] flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center shadow-sm transition md:w-44 ${
        clickable
          ? "cursor-pointer border-slate-200 hover:border-brand hover:shadow-md"
          : "cursor-not-allowed border-slate-100 opacity-70"
      }`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        {node.status === "active" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-30" aria-hidden />
        )}
        <span className={`relative flex h-10 w-10 items-center justify-center rounded-full ${circleStyles}`}>
          <StatusIcon status={node.status} />
        </span>
      </span>
      <span className="text-sm font-semibold leading-tight text-slate-800">{node.title}</span>
      <span className="text-xs text-slate-500">
        {node.fee_php > 0 ? `₱${node.fee_php.toLocaleString("en-PH")}` : "Free"}
        {node.reference_no ? ` · ${node.reference_no}` : ""}
      </span>
    </button>
  );
}

function HorizontalConnector() {
  return (
    <svg className="hidden h-2 w-10 shrink-0 self-center md:block" viewBox="0 0 40 8" fill="none" aria-hidden>
      <line x1="0" y1="4" x2="40" y2="4" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 4" />
    </svg>
  );
}

function VerticalConnector() {
  return (
    <svg className="h-8 w-2 md:hidden" viewBox="0 0 8 32" fill="none" aria-hidden>
      <line x1="4" y1="0" x2="4" y2="32" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 4" />
    </svg>
  );
}

function RowTurn({ side }: { side: "left" | "right" }) {
  return (
    <div className={`hidden md:flex ${side === "right" ? "justify-end pr-10" : "justify-start pl-10"}`}>
      <svg width="80" height="48" viewBox="0 0 80 48" fill="none" aria-hidden>
        <path
          d={side === "right" ? "M40 0 C 76 0, 76 48, 40 48" : "M40 0 C 4 0, 4 48, 40 48"}
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
      </svg>
    </div>
  );
}

/**
 * Connected journey path: vertical on mobile, winding horizontal ≥768px.
 * Locked nodes are not clickable.
 */
export function Roadmap({ nodes, onNodeClick }: RoadmapProps) {
  const rows = chunk(nodes, 3);
  return (
    <div>
      {/* Mobile: vertical path */}
      <div className="flex flex-col items-center md:hidden">
        {nodes.map((node, i) => (
          <Fragment key={node.id}>
            {i > 0 && <VerticalConnector />}
            <NodeCard node={node} onClick={onNodeClick} />
          </Fragment>
        ))}
      </div>
      {/* ≥768px: winding horizontal path */}
      <div className="hidden md:block">
        {rows.map((row, r) => {
          const reversed = r % 2 === 1;
          return (
            <Fragment key={r}>
              <div className={`flex items-stretch justify-center ${reversed ? "flex-row-reverse" : ""}`}>
                {row.map((node, i) => (
                  <Fragment key={node.id}>
                    {i > 0 && <HorizontalConnector />}
                    <NodeCard node={node} onClick={onNodeClick} />
                  </Fragment>
                ))}
              </div>
              {r < rows.length - 1 && <RowTurn side={reversed ? "left" : "right"} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

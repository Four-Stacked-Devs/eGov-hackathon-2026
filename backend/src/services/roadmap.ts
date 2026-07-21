import { readFileSync } from "fs";
import path from "path";
import type { NodeProgress } from "../store";

export interface RoadmapFormField {
  name: string;
  label: string;
  prefillFrom: string | null;
}

export interface RoadmapNode {
  id: string;
  order: number;
  title: string;
  description: string;
  requirements: string[];
  fee_php: number;
  duration_weeks: number;
  office_visit: boolean;
  steps: string[];
  form: RoadmapFormField[];
}

export interface RoadmapDefinition {
  journey_id: string;
  title: string;
  subtitle: string;
  nodes: RoadmapNode[];
}

// SINGLE SOURCE OF TRUTH. Fees/durations in this JSON are demo estimates
// for the hackathon, not official LTO figures.
const definitionPath = path.join(__dirname, "..", "..", "..", "shared", "roadmap.definition.json");

export const roadmapDefinition: RoadmapDefinition = JSON.parse(
  readFileSync(definitionPath, "utf8")
) as RoadmapDefinition;

export const orderedNodes: RoadmapNode[] = [...roadmapDefinition.nodes].sort(
  (a, b) => a.order - b.order
);

export const nodeIds: string[] = orderedNodes.map((n) => n.id);

export function nodeById(id: string): RoadmapNode | undefined {
  return orderedNodes.find((n) => n.id === id);
}

export interface RoadmapSummary {
  total_fee_php: number;
  total_weeks_estimate: number;
  office_visits: number;
}

export function computeSummary(
  nodes: Pick<RoadmapNode, "fee_php" | "duration_weeks" | "office_visit">[]
): RoadmapSummary {
  return {
    total_fee_php: nodes.reduce((sum, n) => sum + n.fee_php, 0),
    total_weeks_estimate: Math.ceil(nodes.reduce((sum, n) => sum + n.duration_weeks, 0)),
    office_visits: nodes.filter((n) => n.office_visit).length,
  };
}

/** New users start with node 1 active and every later node locked. */
export function initialProgress(): Record<string, NodeProgress> {
  const progress: Record<string, NodeProgress> = {};
  orderedNodes.forEach((node, index) => {
    progress[node.id] = { status: index === 0 ? "active" : "locked" };
  });
  return progress;
}

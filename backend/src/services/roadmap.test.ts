import { describe, expect, it } from "vitest";
import { computeSummary, initialProgress, orderedNodes } from "./roadmap";

describe("roadmap summary", () => {
  it("computes totals from the shared definition (never hardcoded)", () => {
    const summary = computeSummary(orderedNodes);
    expect(summary.total_fee_php).toBe(4835);
    expect(summary.total_weeks_estimate).toBe(6);
    expect(summary.office_visits).toBe(3);
  });

  it("rounds total weeks up", () => {
    const summary = computeSummary([
      { fee_php: 0, duration_weeks: 0.5, office_visit: false },
      { fee_php: 0, duration_weeks: 1, office_visit: false },
    ]);
    expect(summary.total_weeks_estimate).toBe(2);
  });
});

describe("initialProgress", () => {
  it("activates node 1 and locks the rest", () => {
    const progress = initialProgress();
    expect(progress[orderedNodes[0]!.id]?.status).toBe("active");
    for (const node of orderedNodes.slice(1)) {
      expect(progress[node.id]?.status).toBe("locked");
    }
  });
});

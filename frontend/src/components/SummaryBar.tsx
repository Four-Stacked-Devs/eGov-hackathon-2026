import type { RoadmapSummary } from "@/lib/types";

export function SummaryBar({ summary }: { summary: RoadmapSummary }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm">
      Total: ₱{summary.total_fee_php.toLocaleString("en-PH")} · est.{" "}
      {summary.total_weeks_estimate} weeks · {summary.office_visits} office visits
    </div>
  );
}

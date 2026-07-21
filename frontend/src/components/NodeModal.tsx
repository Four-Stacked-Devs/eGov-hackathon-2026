"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { apiPost } from "@/lib/api";
import type { RoadmapNode, SubmitResult, UserProfile } from "@/lib/types";
import { LockedField } from "./LockedField";

interface NodeModalProps {
  node: RoadmapNode;
  user: UserProfile;
  onClose: () => void;
  onSubmitted: (result: SubmitResult) => void;
}

function prefillValue(user: UserProfile, key: string): string {
  const value = (user as unknown as Record<string, string | null>)[key];
  return value ?? "";
}

export function NodeModal({ node, user, onClose, onSubmitted }: NodeModalProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readOnly = node.status === "done";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form: Record<string, string> = {};
    for (const field of node.form) {
      form[field.name] = field.prefillFrom
        ? prefillValue(user, field.prefillFrom)
        : (inputs[field.name] ?? "");
    }
    const res = await apiPost<SubmitResult>("/forms/submit", { node_id: node.id, form });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    confetti({ particleCount: 130, spread: 75, origin: { y: 0.65 } });
    onSubmitted(res.data);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={node.title}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{node.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-600">{node.description}</p>

        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          ⚠ Simulated LTO sandbox — demo integration. No real application is filed.
        </div>

        {readOnly && node.reference_no && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            ✓ Submitted — reference <span className="font-mono font-semibold">{node.reference_no}</span>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold text-slate-800">Requirements</h3>
        <ul className="mb-4 space-y-1.5">
          {node.requirements.map((req) => (
            <li key={req} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-0.5 text-success" aria-hidden>✓</span>
              {req}
            </li>
          ))}
        </ul>

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
            Fee: {node.fee_php > 0 ? `₱${node.fee_php.toLocaleString("en-PH")}` : "Free"}
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
            Est. {node.duration_weeks} {node.duration_weeks === 1 ? "week" : "weeks"}
          </span>
        </div>

        <h3 className="mb-2 text-sm font-semibold text-slate-800">Steps</h3>
        <ol className="mb-5 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          {node.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {node.form.length > 0 && !readOnly && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {node.form.map((field) =>
              field.prefillFrom ? (
                <LockedField
                  key={field.name}
                  label={field.label}
                  value={prefillValue(user, field.prefillFrom)}
                />
              ) : (
                <div key={field.name}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="mb-1 block text-xs font-medium text-slate-500"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`field-${field.name}`}
                    value={inputs[field.name] ?? ""}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              )
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </form>
        )}

        {node.form.length === 0 && !readOnly && (
          <form onSubmit={handleSubmit}>
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Mark as claimed"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

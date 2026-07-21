"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { ArrowRight, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { RoadmapNode, SubmitResult, UserProfile } from "@/lib/types";

interface NodeModalProps {
  node: RoadmapNode;
  user: UserProfile;
  onClose: () => void;
  onComplete: (result: SubmitResult) => void;
}

function prefillValue(user: UserProfile, key: string): string {
  const value = (user as unknown as Record<string, string | null>)[key];
  return value ?? "";
}

function feeLabel(fee: number): string {
  return fee > 0 ? `₱${fee.toLocaleString("en-PH")}` : "Free";
}

export function NodeModal({ node, user, onClose, onComplete }: NodeModalProps) {
  // Auto-filled values seed the form but stay editable — the citizen can
  // correct anything (e.g. a preferred mailing address) before submitting.
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const seeded: Record<string, string> = {};
    for (const field of node.form) {
      seeded[field.name] = field.prefillFrom ? prefillValue(user, field.prefillFrom) : "";
    }
    return seeded;
  });
  const [state, setState] = useState<"view" | "submitting" | "success">("view");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const readOnly = node.status === "done";

  function isEdited(field: RoadmapNode["form"][number]): boolean {
    return (
      field.prefillFrom !== null &&
      (inputs[field.name] ?? "") !== prefillValue(user, field.prefillFrom)
    );
  }

  async function submit() {
    setState("submitting");
    setError(null);
    const form: Record<string, string> = {};
    for (const field of node.form) {
      form[field.name] = inputs[field.name] ?? "";
    }
    const res = await apiPost<SubmitResult>("/forms/submit", { node_id: node.id, form });
    if (!res.ok) {
      setError(res.error);
      setState("view");
      return;
    }
    setResult(res.data);
    setState("success");
    confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
    setTimeout(() => onComplete(res.data), 1500);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: "18px 22px", borderBottom: "1px solid var(--line)", display: "flex",
            justifyContent: "space-between", alignItems: "start", position: "sticky", top: 0,
            background: "#fff", borderRadius: "18px 18px 0 0", zIndex: 1,
          }}
        >
          <div>
            <div className="eyebrow">Step {node.order}</div>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, letterSpacing: "-.02em" }}>{node.title}</h3>
          </div>
          <button className="btn btn-ghost" style={{ padding: 8 }} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {state === "success" && result ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--sun)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                <Check size={32} color="#3a2c00" />
              </div>
              <h3 style={{ margin: 0 }}>Submitted to LTO sandbox</h3>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                Reference <b style={{ fontFamily: "monospace" }}>{result.reference_no}</b> — SMS
                confirmation sent 📱. Marking this station done and unlocking the next.
              </p>
            </div>
          ) : (
            <>
              <p style={{ marginTop: 0, color: "#2b3c54" }}>{node.description}</p>

              <div className="sandbox-banner" style={{ margin: "10px 0 14px" }}>
                ⚠ Simulated LTO sandbox — demo integration. No real application is filed.
              </div>

              {readOnly && node.reference_no && (
                <div
                  style={{
                    fontSize: 13, fontWeight: 600, color: "var(--ok)", background: "#EAF7EF",
                    border: "1px solid #BFE5CC", borderRadius: 10, padding: "8px 12px", marginBottom: 14,
                  }}
                >
                  ✓ Submitted — reference <span style={{ fontFamily: "monospace" }}>{node.reference_no}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 18px" }}>
                <span className="tag" style={{ background: "#EAF0FB", color: "var(--route)" }}>
                  Fee: {feeLabel(node.fee_php)}
                </span>
                <span className="tag" style={{ background: "#EAF0FB", color: "var(--route)" }}>
                  Est. {node.duration_weeks} {node.duration_weeks === 1 ? "week" : "weeks"}
                </span>
                {node.form.length > 0 && (
                  <span className="tag" style={{ background: "#FFF6DA", color: "#8a6d00" }}>
                    Form auto-fills from your ID
                  </span>
                )}
              </div>

              <div className="eyebrow" style={{ color: "var(--muted)" }}>What you&rsquo;ll need</div>
              <div style={{ margin: "8px 0 16px" }}>
                {node.requirements.map((req) => (
                  <div className="pre-step" key={req}>
                    <Check size={16} color="var(--ok)" style={{ flex: "0 0 auto", marginTop: 1 }} /> {req}
                  </div>
                ))}
              </div>

              <div className="eyebrow" style={{ color: "var(--muted)" }}>How to do it</div>
              <div style={{ margin: "8px 0 18px" }}>
                {node.steps.map((step, i) => (
                  <div className="pre-step" key={step}>
                    <span className="num">{i + 1}</span> <span>{step}</span>
                  </div>
                ))}
              </div>

              {node.form.length > 0 && !readOnly && (
                <>
                  <div style={{ height: 1, background: "var(--line)", margin: "6px 0 16px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div className="eyebrow" style={{ color: "var(--ink)" }}>Application form</div>
                    <span className="badge-onceonly"><ShieldCheck size={11} /> Pre-filled once-only</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {node.form.map((field) => {
                      const auto = field.prefillFrom !== null;
                      const edited = isEdited(field);
                      const wide = field.name === "address" || field.name === "full_name";
                      return (
                        <div
                          className={"field" + (auto && !edited ? " auto" : "")}
                          key={field.name}
                          style={{ gridColumn: wide ? "1 / -1" : "auto" }}
                        >
                          <label htmlFor={`field-${field.name}`}>
                            {field.label}{" "}
                            {auto && !edited && (
                              <span style={{ color: "#8a6d00", fontWeight: 700 }}>· auto</span>
                            )}
                            {edited && (
                              <>
                                <span style={{ color: "var(--route)", fontWeight: 700 }}>· edited</span>{" "}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInputs((prev) => ({
                                      ...prev,
                                      [field.name]: prefillValue(user, field.prefillFrom as string),
                                    }))
                                  }
                                  style={{
                                    background: "none", border: 0, padding: 0, font: "inherit",
                                    fontSize: 11, fontWeight: 600, color: "var(--muted)",
                                    textDecoration: "underline", cursor: "pointer",
                                  }}
                                >
                                  undo
                                </button>
                              </>
                            )}
                          </label>
                          <input
                            id={`field-${field.name}`}
                            value={inputs[field.name] ?? ""}
                            onChange={(e) =>
                              setInputs((prev) => ({ ...prev, [field.name]: e.target.value }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
                    Fields marked <b>auto</b> were filled from your verified identity via eVerify —
                    you didn&rsquo;t type them. You can still correct any field before submitting.
                  </p>
                </>
              )}

              {error && (
                <p style={{ color: "#B4232C", fontSize: 13.5, marginTop: 12 }}>{error}</p>
              )}

              {!readOnly && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                  <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => void submit()} disabled={state === "submitting"}>
                    {state === "submitting" ? (
                      <><Loader2 size={16} className="spin" /> Submitting…</>
                    ) : node.form.length > 0 ? (
                      <>Review &amp; submit to LTO sandbox <ArrowRight size={15} /></>
                    ) : (
                      <>Mark step done <Check size={15} /></>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

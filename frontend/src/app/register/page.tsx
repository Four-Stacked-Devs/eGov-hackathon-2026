"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check, Loader2, ScanFace } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { AuthResult } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { SandboxBadge } from "@/components/SandboxBadge";

interface EkycResult {
  photo: string;
  session_id: string;
  photo_url: string;
}

interface EkycResponse {
  status: string;
  result: EkycResult;
}

declare global {
  interface Window {
    eKYC?: () => { start: (opts: { pubKey: string }) => Promise<EkycResponse> };
  }
}

type Phase = "idle" | "scanning" | "verifying" | "done";

const todayIso = new Date().toISOString().slice(0, 10);

/** Decode an opaque eKYC SDK error into a readable message + actionable hint. */
function describeEkycError(err: unknown): { message: string; hint: string } {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (/\b401\b|unauthor/i.test(raw)) {
    return {
      message: "The face-scan service rejected the key (401 Unauthorized).",
      hint: "NEXT_PUBLIC_EKYC_PUBKEY is invalid or not authorized for this app — try a different key or get the real eKYC pubKey from the hackathon organizers.",
    };
  }
  if (/\b403\b|forbidden/i.test(raw)) {
    return {
      message: "The face-scan service refused this origin (403 Forbidden).",
      hint: "The pubKey is likely locked to a registered domain — test on the deployed Vercel URL rather than localhost.",
    };
  }
  if (/network|failed to fetch|load resource|networkerror/i.test(raw)) {
    return {
      message: "Couldn't reach the face-scan service.",
      hint: "Check your connection, or the liveness SDK/API may be unavailable.",
    };
  }
  if (/cancel|closed|abort/i.test(raw)) {
    return { message: "Face check was cancelled before it completed.", hint: "" };
  }
  return {
    message: raw || "Face check was cancelled or didn't complete.",
    hint: "",
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState("");
  const [simulated, setSimulated] = useState(false);

  const formValid =
    firstName.trim() !== "" &&
    middleName.trim() !== "" &&
    lastName.trim() !== "" &&
    /^\d{4}-\d{2}-\d{2}$/.test(birthDate) &&
    birthDate <= todayIso;

  async function verify() {
    setError(null);
    if (typeof window.eKYC === "undefined") {
      setError("Verification SDK still loading — try again in a moment.");
      return;
    }
    const pubKey = (process.env.NEXT_PUBLIC_EKYC_PUBKEY ?? "").trim();
    if (pubKey === "") {
      console.error("[eKYC] NEXT_PUBLIC_EKYC_PUBKEY is empty — cannot start a scan.");
      setError(
        "Face verification isn't configured — NEXT_PUBLIC_EKYC_PUBKEY is missing. Set it in the environment and redeploy."
      );
      return;
    }
    // Public key, but log a masked form so you can confirm *which* key is
    // loaded without pasting the full value into the console.
    const maskedKey = `${pubKey.slice(0, 8)}…(${pubKey.length} chars)`;
    setPhase("scanning");
    let session_id: string;
    try {
      console.info("[eKYC] creating liveness session", {
        pubKey: maskedKey,
        origin: window.location.origin,
      });
      const response = await window.eKYC().start({ pubKey });
      // Use ONLY result.session_id — the photo/photo_url are never uploaded.
      session_id = response.result.session_id;
      console.info("[eKYC] liveness session created", { session_id });
    } catch (err) {
      const { message, hint } = describeEkycError(err);
      // Structured log so a bad pubKey (401) / origin lock (403) / denied
      // camera / user cancel are all distinguishable at a glance.
      console.error("[eKYC] face scan failed", {
        summary: message,
        name: err instanceof Error ? err.name : typeof err,
        detail: err instanceof Error ? err.message : String(err),
        pubKeyUsed: maskedKey,
        origin: window.location.origin,
        raw: err,
      });
      setError(hint ? `${message} ${hint}` : message);
      setPhase("idle");
      return;
    }
    setPhase("verifying");
    const res = await apiPost<AuthResult>("/auth/verify", {
      first_name: firstName.trim(),
      middle_name: middleName.trim(),
      last_name: lastName.trim(),
      ...(suffix.trim() !== "" ? { suffix: suffix.trim() } : {}),
      birth_date: birthDate,
      session_id,
    });
    if (!res.ok) {
      const detail = [res.error, res.hint].filter(Boolean).join(" ");
      setError(detail || "We couldn't match those details with PhilSys. Check spelling and birth date.");
      setPhase("idle");
      return;
    }
    setWelcomeName(res.data.user.first_name);
    setSimulated(res.data.simulated);
    setPhase("done");
    setTimeout(() => router.replace("/dashboard"), 1200);
  }

  const busy = phase === "scanning" || phase === "verifying";

  return (
    <div className="haviflow minvh-screen" style={{ display: "grid", placeItems: "center", padding: 16 }}>
      <Script
        src="https://hackathon-everify-face-liveness.e.gov.ph/js/everify-liveness-sdk.min.js"
        strategy="afterInteractive"
      />
      <div className="card" style={{ maxWidth: 440, width: "100%", padding: 26, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <Logo />
        </div>
        <div className="eyebrow" style={{ marginTop: 6 }}>Register / Sign in</div>
        <h2 style={{ fontSize: 22, margin: "8px 0 4px", letterSpacing: "-.02em" }}>Prove it&rsquo;s you, once</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>
          Enter your name as printed on your National ID — your live face scan fills in the
          rest from PhilSys, and you&rsquo;ll never re-type them.
        </p>

        <div
          style={{
            position: "relative", height: 150, margin: "16px auto", width: 150, borderRadius: 18,
            border: "1px solid var(--line)", background: "#F7FAFF", display: "grid",
            placeItems: "center", overflow: "hidden",
          }}
        >
          {phase === "scanning" && <div className="scanline" />}
          {phase === "done" ? (
            <div style={{ display: "grid", placeItems: "center", gap: 8 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--sun)", display: "grid", placeItems: "center" }}>
                <Check size={30} color="#3a2c00" />
              </div>
              <b>Verified</b>
            </div>
          ) : (
            <ScanFace size={64} color={busy ? "var(--route)" : "#9DB2D4"} />
          )}
        </div>

        {phase === "done" ? (
          <p style={{ fontSize: 14, color: "var(--ok)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
            Welcome, {welcomeName}. Opening your copilot… {simulated && <SandboxBadge />}
          </p>
        ) : phase === "verifying" ? (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            <Loader2 size={14} className="spin" style={{ verticalAlign: "-2px" }} /> Matching against PhilSys…
          </p>
        ) : phase === "scanning" ? (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            <Loader2 size={14} className="spin" style={{ verticalAlign: "-2px" }} /> Follow the prompts in the face scanner…
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10, textAlign: "left" }}>
            <div className="field">
              <label htmlFor="first_name">First name</label>
              <input id="first_name" value={firstName} autoComplete="given-name"
                onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="middle_name">Middle name</label>
              <input id="middle_name" value={middleName} autoComplete="additional-name"
                onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" value={lastName} autoComplete="family-name"
                onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="suffix">
                Suffix <span style={{ fontWeight: 500, color: "var(--muted)" }}>(optional — Jr., III…)</span>
              </label>
              <input id="suffix" value={suffix} autoComplete="honorific-suffix"
                onChange={(e) => setSuffix(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="birth_date">Birth date</label>
              <input id="birth_date" type="date" max={todayIso} value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            {error && (
              <p style={{ fontSize: 13, color: "#B4232C", background: "#FDECEC", borderRadius: 9, padding: "8px 10px", margin: 0 }}>
                {error}
              </p>
            )}
            <button
              className="btn btn-primary"
              style={{ justifyContent: "center" }}
              onClick={() => void verify()}
              disabled={!formValid || busy}
            >
              <ScanFace size={18} /> {error ? "Try again" : "Verify My Face"}
            </button>
            {/* PROD: replace with real eGovPH-initiated redirect */}
            <Link href="/egovph/sso?exchange_code=DEMO_EXCHANGE_CODE" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              Continue with eGovPH
            </Link>
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)" }}>
          Live eVerify + Face Liveness — only the scan&rsquo;s session ID is used; no photo is uploaded.
        </div>
        <Link href="/" style={{ display: "block", marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}

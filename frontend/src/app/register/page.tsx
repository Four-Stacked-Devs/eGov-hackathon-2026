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

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState("");
  const [simulated, setSimulated] = useState(false);

  const formValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    /^\d{4}-\d{2}-\d{2}$/.test(birthDate) &&
    birthDate <= todayIso;

  async function verify() {
    setError(null);
    if (typeof window.eKYC === "undefined") {
      setError("Verification SDK still loading — try again in a moment.");
      return;
    }
    setPhase("scanning");
    let session_id: string;
    try {
      const response = await window.eKYC().start({
        pubKey: process.env.NEXT_PUBLIC_EKYC_PUBKEY ?? "",
      });
      // Use ONLY result.session_id — the photo/photo_url are never uploaded.
      session_id = response.result.session_id;
    } catch {
      setError("Face check was cancelled or didn't complete.");
      setPhase("idle");
      return;
    }
    setPhase("verifying");
    const res = await apiPost<AuthResult>("/auth/verify", {
      first_name: firstName.trim(),
      ...(middleName.trim() !== "" ? { middle_name: middleName.trim() } : {}),
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
    <div className="ruta" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
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
          Type just three details — your live face scan fills in the rest from PhilSys, and
          you&rsquo;ll never re-type them.
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
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" value={lastName} autoComplete="family-name"
                onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="birth_date">Birth date</label>
              <input id="birth_date" type="date" max={todayIso} value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              style={{ background: "none", border: 0, font: "inherit", fontSize: 12, fontWeight: 600, color: "var(--muted)", cursor: "pointer", textAlign: "left", padding: 0 }}
            >
              {moreOpen ? "▾" : "▸"} More (middle name, suffix)
            </button>
            {moreOpen && (
              <>
                <div className="field">
                  <label htmlFor="middle_name">Middle name (optional)</label>
                  <input id="middle_name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="suffix">Suffix (optional)</label>
                  <input id="suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} />
                </div>
              </>
            )}
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

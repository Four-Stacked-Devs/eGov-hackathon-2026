"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { apiPost } from "@/lib/api";
import type { AuthResult, UserProfile } from "@/lib/types";
import { LockedField } from "@/components/LockedField";
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

type Phase = "idle" | "scanning" | "verifying" | "success";

const todayIso = new Date().toISOString().slice(0, 10);

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
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
      // Show the backend's specific reason when it has one (e.g. a liveness
      // error vs. a PhilSys mismatch), falling back to the generic copy.
      const detail = [res.error, res.hint].filter(Boolean).join(" ");
      setError(
        detail || "We couldn't match those details with PhilSys. Check spelling and birth date."
      );
      setPhase("idle");
      return;
    }
    setUser(res.data.user);
    setSimulated(res.data.simulated);
    setPhase("success");
  }

  if (phase === "success" && user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="animate-[fadeIn_0.5s_ease-out] rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-white">
                ✓
              </span>
              Identity Verified
            </h1>
            {simulated && <SandboxBadge />}
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Your profile was filled automatically from PhilSys. These fields are locked —
            you&apos;ll never have to re-type them.
          </p>
          <div className="space-y-3">
            <LockedField label="Full Name" value={user.full_name} />
            <LockedField label="Birth Date" value={user.birth_date} />
            <LockedField label="Gender" value={user.gender ?? ""} />
            <LockedField label="Mobile Number" value={user.mobile_number ?? ""} />
            <LockedField label="Email" value={user.email ?? ""} />
            <LockedField label="Address" value={user.full_address ?? ""} />
            <LockedField label="Marital Status" value={user.marital_status ?? ""} />
          </div>
          <Link
            href="/dashboard"
            className="mt-5 block w-full rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Go to my roadmap
          </Link>
        </div>
      </main>
    );
  }

  const busy = phase === "scanning" || phase === "verifying";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Script
        src="https://hackathon-everify-face-liveness.e.gov.ph/js/everify-liveness-sdk.min.js"
        strategy="afterInteractive"
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Register with Face Verification</h1>
        <p className="mt-1 text-sm text-slate-500">
          Type just three details — your live face scan fills in the rest from PhilSys.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="first_name" className="mb-1 block text-xs font-medium text-slate-500">
              First name
            </label>
            <input
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="mb-1 block text-xs font-medium text-slate-500">
              Last name
            </label>
            <input
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label htmlFor="birth_date" className="mb-1 block text-xs font-medium text-slate-500">
              Birth date
            </label>
            <input
              id="birth_date"
              type="date"
              max={todayIso}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            {moreOpen ? "▾" : "▸"} More (middle name, suffix)
          </button>
          {moreOpen && (
            <div className="space-y-3">
              <div>
                <label htmlFor="middle_name" className="mb-1 block text-xs font-medium text-slate-500">
                  Middle name (optional)
                </label>
                <input
                  id="middle_name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label htmlFor="suffix" className="mb-1 block text-xs font-medium text-slate-500">
                  Suffix (optional)
                </label>
                <input
                  id="suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="button"
          onClick={() => void verify()}
          disabled={!formValid || busy}
          className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {phase === "scanning"
            ? "Follow the prompts in the face scanner…"
            : phase === "verifying"
              ? "Verifying with PhilSys…"
              : error
                ? "Try again"
                : "Verify My Face"}
        </button>

        <Link href="/" className="mt-4 block text-center text-xs font-medium text-slate-400 hover:text-slate-600">
          Back to home
        </Link>
      </div>
    </main>
  );
}

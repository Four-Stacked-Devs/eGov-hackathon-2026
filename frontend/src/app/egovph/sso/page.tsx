"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { AuthResult } from "@/lib/types";
import { Logo } from "@/components/Logo";

type Phase = "loading" | "error";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ruta" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", padding: 26, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}

function SsoCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const exchangeCode = searchParams.get("exchange_code");
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const startedRef = useRef(false);

  const signIn = useCallback(async () => {
    if (!exchangeCode) return;
    setPhase("loading");
    const res = await apiPost<AuthResult>("/auth/sso", { exchange_code: exchangeCode });
    if (res.ok) {
      router.replace("/dashboard");
      return;
    }
    setErrorMessage([res.error, res.hint].filter(Boolean).join(" "));
    setPhase("error");
  }, [exchangeCode, router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void signIn();
  }, [signIn]);

  if (!exchangeCode) {
    return (
      <Shell>
        <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Invalid sign-in link</h2>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          This page needs to be opened from an eGovPH sign-in.
        </p>
        <Link href="/" className="btn btn-primary" style={{ justifyContent: "center", marginTop: 8 }}>
          Back to home
        </Link>
      </Shell>
    );
  }

  if (phase === "error") {
    return (
      <Shell>
        <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Sign-in didn&rsquo;t complete</h2>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{errorMessage}</p>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => void signIn()}>
            Retry
          </button>
          <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
            Back to home
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p style={{ fontSize: 14, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Loader2 size={16} className="spin" /> Signing you in with eGovPH…
      </p>
    </Shell>
  );
}

export default function SsoPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</p>
        </Shell>
      }
    >
      <SsoCallback />
    </Suspense>
  );
}

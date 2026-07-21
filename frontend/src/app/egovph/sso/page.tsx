"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import type { AuthResult } from "@/lib/types";

type Phase = "loading" | "error";

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
    setErrorMessage(res.error);
    setPhase("error");
  }, [exchangeCode, router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void signIn();
  }, [signIn]);

  if (!exchangeCode) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Invalid sign-in link</h1>
          <p className="mt-2 text-sm text-slate-600">
            This page needs to be opened from an eGovPH sign-in.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (phase === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Sign-in didn&apos;t complete</h1>
          <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void signIn()}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Retry
            </button>
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" aria-hidden />
      <p className="text-sm font-medium text-slate-700">Signing you in with eGovPH…</p>
    </main>
  );
}

export default function SsoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" aria-hidden />
        </main>
      }
    >
      <SsoCallback />
    </Suspense>
  );
}

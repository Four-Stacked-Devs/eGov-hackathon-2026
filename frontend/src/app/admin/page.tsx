"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface TokenStatus {
  cached: boolean;
  expires_in_s: number | null;
}

interface AdminStatus {
  tokens: { sso: TokenStatus; everify: TokenStatus; egovai: TokenStatus };
  mocks: { SSO_MOCK: boolean; SMS_MOCK: boolean };
  egovai_credits_remaining: number | "unknown";
  users_in_memory: number;
}

/** Dev-only status page — intentionally unlinked from the rest of the UI. */
export default function AdminPage() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const res = await apiGet<AdminStatus>("/admin/status");
      if (cancelled) return;
      if (res.ok) {
        setStatus(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    }
    void poll();
    const interval = setInterval(() => void poll(), 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-slate-900">HaviFlow dev status</h1>
      <p className="mb-6 text-sm text-slate-500">Refreshes every 10 seconds.</p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {!status && !error && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 28, width: `${90 - i * 12}%` }} />
          ))}
        </div>
      )}

      {status && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Gov API tokens</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-1.5 pr-4">Service</th>
                  <th className="py-1.5 pr-4">Cached</th>
                  <th className="py-1.5">Expires in</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(status.tokens) as [string, TokenStatus][]).map(
                  ([name, token]) => (
                    <tr key={name} className="border-b border-slate-100">
                      <td className="py-1.5 pr-4 font-mono">{name}</td>
                      <td className="py-1.5 pr-4">{token.cached ? "✅ yes" : "— no"}</td>
                      <td className="py-1.5">
                        {token.expires_in_s !== null ? `${token.expires_in_s}s` : "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Mock flags</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(status.mocks) as [string, boolean][]).map(([flag, on]) => (
                <span
                  key={flag}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    on ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {flag}: {on ? "ON" : "OFF"}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap gap-8">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">eGov AI credits</h2>
              <p className="text-4xl font-extrabold text-brand">
                {status.egovai_credits_remaining}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Users in memory</h2>
              <p className="text-4xl font-extrabold text-slate-800">{status.users_in_memory}</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

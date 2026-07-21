import Link from "next/link";

const COMING_SOON = ["I had a baby", "I lost my wallet", "Starting a business"];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        <p className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
          eGov Hackathon 2026
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          GabAI <span className="text-brand">PH</span>
        </h1>
        <p className="mt-3 text-lg font-medium text-slate-700">
          Verify once with your face. Get a living roadmap to your driver&apos;s license.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          One face scan fills your whole profile from PhilSys — then follow a clickable,
          step-by-step path from Student Permit to Non-Professional License.
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3">
          {/* PROD: replace with real eGovPH-initiated redirect */}
          <Link
            href="/egovph/sso?exchange_code=DEMO_EXCHANGE_CODE"
            className="w-full rounded-xl bg-brand px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Continue with eGovPH
          </Link>
          <Link
            href="/register"
            className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand hover:text-brand"
          >
            Register with Face Verification
          </Link>
        </div>

        <div className="mt-12 w-full">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            More life-event roadmaps
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COMING_SOON.map((title) => (
              <div
                key={title}
                aria-disabled
                className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm font-medium text-locked"
              >
                {title}
                <span className="mt-1 block text-xs font-normal">Coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

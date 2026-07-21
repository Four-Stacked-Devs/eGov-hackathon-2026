import Link from "next/link";
import { ArrowRight, MapPin, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    icon: <ScanFace size={20} color="var(--route)" />,
    title: "One face, no forms",
    body: "eVerify + Face Liveness confirm it's really you, then your PhilSys identity fills every field.",
  },
  {
    icon: <Sparkles size={20} color="var(--route)" />,
    title: "Ask anything",
    body: "A copilot chat with shortcuts for the questions every Filipino asks — licences, certificates, SSS, passports.",
  },
  {
    icon: <MapPin size={20} color="var(--route)" />,
    title: "Routes, not runarounds",
    body: "Big journeys become a clickable route beside the chat. Tap a station, review the pre-filled form, submit.",
  },
];

export default function LandingPage() {
  return (
    <div className="haviflow" style={{ minHeight: "100vh" }}>
      <header className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
        <Logo />
        <span className="chip">
          <ShieldCheck size={15} color="var(--route)" /> Once-Only Policy
        </span>
      </header>

      <section className="wrap" style={{ padding: "48px 20px 40px", position: "relative" }}>
        <svg
          viewBox="0 0 1120 300"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5, zIndex: 0 }}
          aria-hidden
        >
          <path
            d="M-20 250 C 200 250, 200 90, 420 90 S 640 210, 860 210 S 1080 70, 1160 70"
            stroke="#CFDBF0" strokeWidth="2" fill="none" strokeDasharray="1 8" strokeLinecap="round"
          />
        </svg>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          <div className="eyebrow">A copilot for Philippine government</div>
          <h1 style={{ fontSize: "clamp(34px, 7vw, 52px)", lineHeight: 1.04, letterSpacing: "-.03em", margin: "14px 0 0", fontWeight: 800 }}>
            Verify once.<br />Then just ask,<br />
            <span style={{ color: "var(--route)" }}>not apply.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", maxWidth: 560, marginTop: 18 }}>
            Sign in with your face — type three details once, and your verified profile fills
            every government form after that. Ask anything: answers on the right, your route on
            the left.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary">
              <ScanFace size={18} /> Get started <ArrowRight size={16} />
            </Link>
            {/* PROD: replace with real eGovPH-initiated redirect */}
            <Link href="/egovph/sso?exchange_code=DEMO_EXCHANGE_CODE" className="btn btn-ghost">
              Continue with eGovPH
            </Link>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="chip" style={{ padding: "10px 14px" }}>
              <Sparkles size={15} color="var(--sun)" /> Live demo route:&nbsp;<b>Driver&rsquo;s licence</b>
            </span>
          </div>
        </div>
      </section>

      <section
        className="wrap"
        style={{ paddingBottom: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}
      >
        {FEATURES.map((c) => (
          <div className="card" key={c.title} style={{ padding: 20 }}>
            <div style={{ marginBottom: 10 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{c.body}</div>
          </div>
        ))}
      </section>

      <footer className="wrap" style={{ padding: "0 20px 40px", color: "var(--muted)", fontSize: 12.5 }}>
        Built for the DICT eGov Hackathon. Identity (eVerify + Face Liveness), SMS (eMessage), and
        AI (eGov AI) are live government APIs; LTO submissions are simulated and labelled as such.
      </footer>
    </div>
  );
}

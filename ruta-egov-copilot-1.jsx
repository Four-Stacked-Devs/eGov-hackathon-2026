import React, { useState, useRef, useEffect } from "react";
import {
  Fingerprint, ScanFace, ShieldCheck, ArrowRight, Check, Lock,
  Send, X, BadgeCheck, Sparkles, ChevronRight, Loader2,
  Car, Heart, Landmark, Plane, CreditCard, MapPin,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   RUTA — an eGov copilot concept (split layout).
   Verify once → workspace: interactive ROUTE on the LEFT,
   ChatGPT-like COPILOT on the RIGHT, with FAQ shortcuts.
   Real: the flow + AI chat. Mocked (labelled): identity return
   and agency submissions.
   ───────────────────────────────────────────────────────────── */

const CSS = `
:root{
  --ink:#0C1E33; --route:#1E5BC6; --route-deep:#12408F; --sun:#F4B400;
  --paper:#EEF2F8; --card:#FFFFFF; --line:#DCE3EE; --muted:#5B6B85; --ok:#0F9D58;
}
*{box-sizing:border-box}
.ruta{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink);background:var(--paper);min-height:100%;line-height:1.5;
  -webkit-font-smoothing:antialiased}
.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:11px;font-weight:700;color:var(--route)}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.btn{border:0;border-radius:10px;font:inherit;font-weight:600;cursor:pointer;
  display:inline-flex;align-items:center;gap:8px;padding:12px 18px;transition:.15s}
.btn-primary{background:var(--route);color:#fff}
.btn-primary:hover{background:var(--route-deep)}
.btn-ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
.btn-ghost:hover{border-color:var(--route)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px}
.badge-onceonly{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;
  color:#8a6d00;background:#FFF6DA;border:1px solid #F3D77A;border-radius:999px;padding:2px 8px}
.field label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:5px}
.field input,.field select{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:9px;
  font:inherit;font-size:14px;color:var(--ink);background:#fff}
.field input:focus,.field select:focus{outline:2px solid var(--route);outline-offset:-1px;border-color:var(--route)}
.field.auto input{background:#FFFCF2;border-color:#F0DFA6}
.scanline{position:absolute;left:8%;right:8%;height:3px;border-radius:3px;
  background:linear-gradient(90deg,transparent,var(--route),transparent);
  box-shadow:0 0 14px 2px rgba(30,91,198,.6);animation:scan 1.6s ease-in-out infinite}
@keyframes scan{0%{top:14%}50%{top:82%}100%{top:14%}}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(30,91,198,.45)}70%{box-shadow:0 0 0 10px rgba(30,91,198,0)}100%{box-shadow:0 0 0 0 rgba(30,91,198,0)}}
@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.msg{animation:rise .2s ease}
.station-dot{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;
  border:3px solid var(--line);background:#fff;color:var(--muted);transition:.2s}
.station.done .station-dot{background:var(--sun);border-color:var(--sun);color:#3a2c00}
.station.current .station-dot{border-color:var(--route);color:var(--route);animation:pulse 1.8s infinite}
.station.locked{opacity:.55}
.station-row{display:flex;gap:12px;cursor:pointer;position:relative;padding:3px 0}
.station.locked .station-row{cursor:not-allowed}
.station-line{position:absolute;left:14px;top:34px;bottom:-12px;width:3px;background:var(--line)}
.station.done .station-line{background:var(--sun)}
.station-card{flex:1;border:1px solid var(--line);border-radius:11px;padding:10px 12px;background:#fff;transition:.15s}
.station:not(.locked) .station-row:hover .station-card{border-color:var(--route);box-shadow:0 4px 14px rgba(12,30,51,.06)}
.overlay{position:fixed;inset:0;background:rgba(12,30,51,.5);display:flex;align-items:center;
  justify-content:center;padding:18px;z-index:40;animation:rise .15s ease}
.modal{background:#fff;border-radius:18px;max-width:560px;width:100%;max-height:86vh;overflow:auto}
.tag{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px}
.chip{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);
  border-radius:999px;padding:5px 10px 5px 6px;font-size:12.5px;font-weight:600}
.avatar{width:26px;height:26px;border-radius:50%;background:var(--route);color:#fff;display:grid;
  place-items:center;font-size:11px;font-weight:700}
.pre-step{display:flex;gap:10px;font-size:13.5px;color:#2b3c54;margin:7px 0}
.num{flex:0 0 auto;width:20px;height:20px;border-radius:50%;background:#EAF0FB;color:var(--route);
  font-size:11px;font-weight:700;display:grid;place-items:center}
.mini-chip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--line);
  border-radius:999px;padding:7px 12px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;
  color:var(--ink);transition:.15s;white-space:nowrap}
.mini-chip:hover{border-color:var(--route);color:var(--route)}
.spin{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Split workspace layout */
.split{display:grid;grid-template-columns:minmax(300px,380px) minmax(0,1fr);gap:0;flex:1;min-height:0}
.route-pane{border-right:1px solid var(--line);background:#F7FAFF;overflow-y:auto;min-height:0}
.chat-pane{display:flex;flex-direction:column;min-height:0;background:var(--paper)}
@media(max-width:860px){
  .split{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .route-pane{border-right:0;border-bottom:1px solid var(--line);max-height:42vh}
}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
`;

const PROFILE = {
  first_name: "JUAN", middle_name: "DELA", last_name: "CRUZ",
  birth_date: "1999-08-22", gender: "Male", nationality: "Filipino",
  email: "juan.delacruz@mail.ph", mobile: "+63 912 312 3123",
  address: "123 Sample St., Doña Imelda, Quezon City, NCR 1012",
};

const SCHOOLS = ["A1 Driving Academy (accredited)", "Manila Driving School (accredited)",
  "SafeWheels PH (accredited)", "QC Drivers' Education Center (LTO)"];

const FIELD_META = {
  first_name: { label: "First name", auto: true },
  middle_name: { label: "Middle name", auto: true },
  last_name: { label: "Last name", auto: true },
  birth_date: { label: "Date of birth", auto: true, type: "date" },
  gender: { label: "Sex", auto: true },
  nationality: { label: "Nationality", auto: true },
  email: { label: "Email", auto: true },
  mobile: { label: "Mobile number", auto: true },
  address: { label: "Address", auto: true },
  school: { label: "Accredited driving school", auto: false, type: "select", options: SCHOOLS },
};

const NODES = [
  { id: "ltms", step: "Step 1", title: "Register on LTMS", type: "form",
    summary: "Create your Land Transport Management System account — the online gateway for every LTO transaction.",
    prereqs: ["Valid email address", "Mobile number", "PSA birth certificate details"],
    steps: ["Go to portal.lto.gov.ph", "Choose “Enroll as Individual”", "Fill in details as on your PSA birth certificate", "Verify via the email link"],
    fee: "Free", form: ["first_name", "middle_name", "last_name", "birth_date", "email", "mobile"] },
  { id: "tdc", step: "Step 2", title: "Theoretical Driving Course", type: "form",
    summary: "Finish the mandatory 15-hour TDC at an LTO-accredited school — required before any permit is issued.",
    prereqs: ["LTMS account", "Enroll at an accredited school"],
    steps: ["Pick an LTO-accredited school", "Complete 15 hours (online or in-person)", "Receive your TDC certificate"],
    fee: "₱1,000–3,000", form: ["first_name", "last_name", "email", "school"] },
  { id: "permit", step: "Step 3", title: "Apply for Student Permit", type: "form",
    summary: "File your student permit — you must hold it at least 31 days before taking the licence exams.",
    prereqs: ["TDC certificate", "Medical certificate (LTO-accredited clinic)", "PSA birth certificate"],
    steps: ["Book a Student Permit slot on LTMS", "Submit medical + TDC certificates", "Pay the fee and capture biometrics", "Receive your Student Permit"],
    fee: "₱317.63", form: ["first_name", "middle_name", "last_name", "birth_date", "gender", "nationality", "address"] },
  { id: "practice", step: "Step 4", title: "Practice & hold 31 days", type: "info",
    summary: "Drive only with a licensed driver beside you, between 5 AM and 10 PM. Hold the permit at least 31 days.",
    prereqs: ["Valid Student Permit", "A licensed driver as companion"],
    steps: ["Practice with a licensed companion", "Observe the 5 AM–10 PM window", "Wait out the 31-day minimum"],
    fee: "—", form: null },
  { id: "pdc", step: "Step 5", title: "Practical Course + drug test", type: "form",
    summary: "Complete the behind-the-wheel course and pass the drug test (required for new applicants).",
    prereqs: ["Student Permit held ≥ 31 days", "Drug test at an LTO-accredited clinic"],
    steps: ["Enroll in the Practical Driving Course", "Complete behind-the-wheel hours", "Take the drug test", "Receive your PDC certificate"],
    fee: "₱2,000–3,500", form: ["first_name", "last_name", "mobile", "school"] },
  { id: "license", step: "Step 6", title: "Exams → Non-Professional License", type: "form",
    summary: "Pass the written and practical exams to receive your Non-Professional Driver’s License.",
    prereqs: ["PDC certificate", "All previous steps complete"],
    steps: ["Book the exam on LTMS", "Pass the written exam", "Pass the actual driving test", "Pay the fee and claim your license"],
    fee: "₱585 · valid 5–10 yrs", form: ["first_name", "middle_name", "last_name", "birth_date", "gender", "address"] },
];

const FAQS = [
  { id: "license", icon: Car, label: "How to get a driver’s license", kind: "route",
    ask: "How do I get a driver’s license?" },
  { id: "marriage", icon: Heart, label: "Process for a marriage certificate", kind: "answer",
    ask: "What’s the process for getting a marriage certificate?",
    answer: "Here’s the short version for a PSA marriage certificate:\n\n1. Marriage license first — apply at the Local Civil Registrar (LCR) where either of you resides: PSA birth certificates, CENOMAR, valid IDs, and (if 18–25) parental consent/advice. There’s a 10-day posting period.\n2. Get married within 120 days of the license issue.\n3. The solemnizing officer files the certificate with the LCR, which endorses it to the PSA.\n4. After ~1–3 months you can request the PSA copy online (PSAHelpline or PSASerbilis) or at any PSA outlet — ₱155 per copy (walk-in).\n\nWhen this route goes interactive it will appear on the left panel like the driver’s licence one — pre-filled with your verified details." },
  { id: "sss", icon: Landmark, label: "How to get an SSS number", kind: "answer",
    ask: "How do I get an SSS number?",
    answer: "Getting your SSS number is fully online:\n\n1. Go to the SSS website → “No SS Number yet? Apply online.”\n2. Fill in your details (they’d auto-fill from your National ID here — Once-Only Policy).\n3. Check your email for the link, complete the form, and upload your supporting document (PSA birth certificate or ID).\n4. You’ll receive your SS number instantly by email; print the transaction slip.\n5. To use SSS services, register on My.SSS and start posting contributions.\n\nIt’s free — no fees for number issuance. Want me to walk you through employee vs self-employed registration?" },
  { id: "passport", icon: Plane, label: "First-time passport application", kind: "answer",
    ask: "How do I apply for a passport for the first time?",
    answer: "First-time Philippine passport, in brief:\n\n1. Book an appointment at passport.gov.ph (slots open 9 PM daily).\n2. Pay the fee online or at partner outlets — ₱950 (regular, 12 working days) or ₱1,200 (expedited, 6).\n3. Show up with your PSA birth certificate and one valid government ID — your PhilID / National ID counts.\n4. Biometrics + photo are captured on-site.\n5. Claim it or have it delivered.\n\nWith your verified identity, the application form would be pre-filled here — that’s the Ruta promise. The driver’s licence route on the left is the fully interactive demo." },
  { id: "natid", icon: CreditCard, label: "Replace a lost National ID", kind: "answer",
    ask: "How do I replace a lost National ID?",
    answer: "To replace a lost PhilID:\n\n1. Report the loss and execute a notarized Affidavit of Loss.\n2. Book a replacement at a PhilSys registration center (or PHLPost) — bring the affidavit and a supporting ID.\n3. Pay the ₱100 replacement fee (first issuance was free; loss replacement isn’t).\n4. Biometrics are re-verified against your PhilSys record — the same eVerify 1:1 match this demo uses to log you in.\n5. Meanwhile, your Digital National ID on the eGovPH app remains usable.\n\nTip: your ePhilID (printable) can also serve as valid ID while waiting." },
];

function valueFor(key) { return key === "school" ? "" : (PROFILE[key] ?? ""); }
function cap(s) { return s ? s[0] + s.slice(1).toLowerCase() : s; }

/* ── Brand mark ─────────────────────────────────────────────── */
function Logo({ size = 22 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19 C 9 19, 9 5, 14 5 S 20 9, 20 9" stroke="var(--route)" strokeWidth="2.4"
          strokeLinecap="round" strokeDasharray="0.1 4.4" />
        <circle cx="4" cy="19" r="2.6" fill="var(--sun)" />
        <circle cx="20" cy="9" r="2.6" fill="var(--route)" />
      </svg>
      <span style={{ fontWeight: 800, letterSpacing: "-.02em", fontSize: size * .82 }}>Ruta</span>
    </span>
  );
}

/* ── Landing ────────────────────────────────────────────────── */
function Landing({ onStart }) {
  return (
    <div className="ruta">
      <style>{CSS}</style>
      <header className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
        <Logo />
        <span className="chip"><ShieldCheck size={15} color="var(--route)" /> Once-Only Policy</span>
      </header>

      <section className="wrap" style={{ padding: "48px 20px 40px", position: "relative" }}>
        <svg viewBox="0 0 1120 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .5, zIndex: 0 }} aria-hidden>
          <path d="M-20 250 C 200 250, 200 90, 420 90 S 640 210, 860 210 S 1080 70, 1160 70"
            stroke="#CFDBF0" strokeWidth="2" fill="none" strokeDasharray="1 8" strokeLinecap="round" />
        </svg>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          <div className="eyebrow">A copilot for Philippine government</div>
          <h1 style={{ fontSize: 52, lineHeight: 1.04, letterSpacing: "-.03em", margin: "14px 0 0", fontWeight: 800 }}>
            Verify once.<br />Then just ask,<br /><span style={{ color: "var(--route)" }}>not apply.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", maxWidth: 560, marginTop: 18 }}>
            Sign in with your face — no typing your name, birthday, or address ever again.
            Then ask Ruta anything: it answers on the right, maps your route on the left, and fills every form for you.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onStart}>
              <ScanFace size={18} /> Get started <ArrowRight size={16} />
            </button>
            <span className="chip" style={{ padding: "10px 14px" }}>
              <Sparkles size={15} color="var(--sun)" /> Live demo route: <b>Driver’s licence</b>
            </span>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {[
          { i: <ScanFace size={20} color="var(--route)" />, t: "One face, no forms", d: "eVerify + Face Liveness confirm it’s really you, then your Digital National ID fills every field." },
          { i: <Sparkles size={20} color="var(--route)" />, t: "Ask anything", d: "A copilot chat with shortcuts for the questions every Filipino asks — licences, certificates, SSS, passports." },
          { i: <MapPin size={20} color="var(--route)" />, t: "Routes, not runarounds", d: "Big journeys become a clickable route beside the chat. Tap a station, review the pre-filled form, submit." },
        ].map((c, k) => (
          <div className="card" key={k} style={{ padding: 20 }}>
            <div style={{ marginBottom: 10 }}>{c.i}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.t}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{c.d}</div>
          </div>
        ))}
      </section>
      <footer className="wrap" style={{ padding: "0 20px 40px", color: "var(--muted)", fontSize: 12.5 }}>
        Concept demo for the DICT eGov Hackathon. Identity return and agency submissions are mocked and labelled as such.
      </footer>
    </div>
  );
}

/* ── Auth (mock biometric) ──────────────────────────────────── */
function Auth({ onVerified }) {
  const [stage, setStage] = useState("idle");
  const [mode, setMode] = useState("face");

  function run(m) {
    setMode(m); setStage("scanning");
    setTimeout(() => setStage("done"), 1900);
    setTimeout(() => onVerified(PROFILE), 3050);
  }

  return (
    <div className="ruta" style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: 24 }}>
      <style>{CSS}</style>
      <div className="card" style={{ maxWidth: 420, width: "100%", padding: 26, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Logo /></div>
        <div className="eyebrow" style={{ marginTop: 6 }}>Register / Sign in</div>
        <h2 style={{ fontSize: 22, margin: "8px 0 4px", letterSpacing: "-.02em" }}>Prove it’s you, once</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>
          No name, email, or birthday to type. Your verified profile arrives with you.
        </p>

        <div style={{ position: "relative", height: 190, margin: "18px auto", width: 190, borderRadius: 18,
          border: "1px solid var(--line)", background: "#F7FAFF", display: "grid", placeItems: "center", overflow: "hidden" }}>
          {stage === "scanning" && <div className="scanline" />}
          {stage === "done"
            ? <div style={{ display: "grid", placeItems: "center", gap: 8 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--sun)", display: "grid", placeItems: "center" }}>
                  <Check size={30} color="#3a2c00" />
                </div>
                <b>Verified</b>
              </div>
            : mode === "face"
              ? <ScanFace size={72} color={stage === "scanning" ? "var(--route)" : "#9DB2D4"} />
              : <Fingerprint size={72} color={stage === "scanning" ? "var(--route)" : "#9DB2D4"} />}
        </div>

        {stage === "done"
          ? <p style={{ fontSize: 14, color: "var(--ok)", fontWeight: 600 }}>Welcome, {PROFILE.first_name}. Opening your copilot…</p>
          : stage === "scanning"
            ? <p style={{ fontSize: 14, color: "var(--muted)" }}><Loader2 size={14} className="spin" style={{ verticalAlign: "-2px" }} /> Matching against PhilSys…</p>
            : <div style={{ display: "grid", gap: 10 }}>
                <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => run("face")}>
                  <ScanFace size={18} /> Face verification
                </button>
                <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => run("finger")}>
                  <Fingerprint size={18} /> Fingerprint
                </button>
              </div>}

        <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)" }}>
          Demo verification — mocks eVerify / Face Liveness. No real biometric is captured.
        </div>
      </div>
    </div>
  );
}

/* ── Node modal (auto-filled forms) ─────────────────────────── */
function NodeModal({ node, onClose, onComplete }) {
  const [vals, setVals] = useState(() => {
    const o = {}; (node.form || []).forEach(k => { o[k] = valueFor(k); }); return o;
  });
  const [state, setState] = useState("view");
  const isForm = node.type === "form";

  function submit() {
    setState("submitting");
    setTimeout(() => setState("success"), 1300);
    setTimeout(() => onComplete(node), 2300);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "start", position: "sticky", top: 0, background: "#fff", borderRadius: "18px 18px 0 0" }}>
          <div>
            <div className="eyebrow">{node.step}</div>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, letterSpacing: "-.02em" }}>{node.title}</h3>
          </div>
          <button className="btn btn-ghost" style={{ padding: 8 }} onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div style={{ padding: 22 }}>
          {state === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--sun)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                <Check size={32} color="#3a2c00" />
              </div>
              <h3 style={{ margin: 0 }}>{isForm ? "Submitted to LTO" : "Step complete"}</h3>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                {isForm ? "Your pre-filled request was filed (demo). " : ""}Marking this station done and unlocking the next.
              </p>
            </div>
          ) : (
            <>
              <p style={{ marginTop: 0, color: "#2b3c54" }}>{node.summary}</p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 18px" }}>
                <span className="tag" style={{ background: "#EAF0FB", color: "var(--route)" }}>Fee: {node.fee}</span>
                {isForm && <span className="tag" style={{ background: "#FFF6DA", color: "#8a6d00" }}>Form auto-fills from your ID</span>}
              </div>

              <div className="eyebrow" style={{ color: "var(--muted)" }}>What you’ll need</div>
              <div style={{ margin: "8px 0 16px" }}>
                {node.prereqs.map((p, i) => (
                  <div className="pre-step" key={i}><Check size={16} color="var(--ok)" style={{ flex: "0 0 auto", marginTop: 1 }} /> {p}</div>
                ))}
              </div>

              <div className="eyebrow" style={{ color: "var(--muted)" }}>How to do it</div>
              <div style={{ margin: "8px 0 18px" }}>
                {node.steps.map((s, i) => (
                  <div className="pre-step" key={i}><span className="num">{i + 1}</span> <span>{s}</span></div>
                ))}
              </div>

              {isForm && (
                <>
                  <div style={{ height: 1, background: "var(--line)", margin: "6px 0 16px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div className="eyebrow" style={{ color: "var(--ink)" }}>Application form</div>
                    <span className="badge-onceonly"><ShieldCheck size={11} /> Pre-filled once-only</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {node.form.map(key => {
                      const m = FIELD_META[key];
                      return (
                        <div className={"field" + (m.auto ? " auto" : "")} key={key}
                          style={{ gridColumn: (key === "address") ? "1 / -1" : "auto" }}>
                          <label>{m.label} {m.auto && <span style={{ color: "#8a6d00", fontWeight: 700 }}>· auto</span>}</label>
                          {m.type === "select" ? (
                            <select value={vals[key]} onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))}>
                              <option value="">Select…</option>
                              {m.options.map(o => <option key={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input type={m.type || "text"} value={vals[key]}
                              onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
                    Fields marked <b>auto</b> came from your Digital National ID via eGovPH — you didn’t type them. Review, then submit.
                  </p>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={submit} disabled={state === "submitting"}>
                  {state === "submitting"
                    ? <><Loader2 size={16} className="spin" /> Submitting…</>
                    : isForm ? <>Review &amp; submit to LTO <ArrowRight size={15} /></> : <>Mark step done <Check size={15} /></>}
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "right", marginTop: 8 }}>
                Demo — no live government platform is contacted.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Left pane: the route ───────────────────────────────────── */
function RoutePane({ routeShown, done, onOpen, onStartRoute }) {
  const firstOpen = NODES.findIndex(n => !done[n.id]);
  const doneCount = Object.values(done).filter(Boolean).length;

  if (!routeShown) {
    return (
      <div style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: "100%" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "#EAF0FB", display: "grid", placeItems: "center", marginBottom: 14 }}>
          <MapPin size={24} color="var(--route)" />
        </div>
        <b style={{ fontSize: 15.5 }}>No active route yet</b>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 260, margin: "6px 0 16px" }}>
          Ask Ruta about a goal — like getting a driver’s licence — and your step-by-step route will appear here.
        </p>
        <button className="btn btn-primary" onClick={onStartRoute}>
          <Car size={16} /> Start: Driver’s licence
        </button>
        <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--muted)" }}>
          More routes (marriage, SSS, passport…) coming soon — demo has one live route.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "18px 18px 24px" }}>
      <div className="eyebrow">Your route</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "4px 0 2px" }}>
        <b style={{ fontSize: 16 }}>Non-Professional Licence</b>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{doneCount}/{NODES.length}</span>
      </div>
      <div style={{ height: 6, background: "var(--line)", borderRadius: 999, overflow: "hidden", margin: "8px 0 6px" }}>
        <div style={{ height: "100%", width: `${(doneCount / NODES.length) * 100}%`, background: "var(--sun)", borderRadius: 999, transition: "width .4s" }} />
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
        Tap a station to see what to do — and file it in place.
      </p>

      {NODES.map((n, i) => {
        const isDone = !!done[n.id];
        const locked = firstOpen !== -1 && i > firstOpen;
        const current = i === firstOpen;
        const cls = "station " + (isDone ? "done" : locked ? "locked" : current ? "current" : "");
        return (
          <div className={cls} key={n.id}>
            <div className="station-row" onClick={() => !locked && onOpen(n)} role="button" tabIndex={locked ? -1 : 0}
              onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !locked) onOpen(n); }}>
              {i < NODES.length - 1 && <span className="station-line" />}
              <div className="station-dot">
                {isDone ? <Check size={16} /> : locked ? <Lock size={13} /> : <span style={{ fontWeight: 700, fontSize: 12 }}>{i + 1}</span>}
              </div>
              <div className="station-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: current ? "var(--route)" : "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{n.step}</div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{n.title}</div>
                  </div>
                  {!locked && <ChevronRight size={16} color="var(--muted)" />}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                  {n.type === "form" ? "Form auto-fills · " : "Checkpoint · "}Fee {n.fee}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Chat fallback brain (offline-safe) ─────────────────────── */
function fallbackReply(text, done) {
  const t = text.toLowerCase();
  if (t.includes("medical")) return "For the medical certificate, visit any LTO-accredited clinic. They check vision (including colour blindness), hearing, and general fitness. Bring a valid ID; results are usually same-day and feed into Step 3 on your route.";
  if (t.includes("how long") || t.includes("31")) return "You must hold the Student Permit for at least 31 days before you can take the licence exams — that’s Step 4 on the route panel.";
  if (t.includes("cost") || t.includes("fee") || t.includes("magkano")) return "Rough costs for the licence route: Student Permit ₱317.63, the licence itself ₱585, plus driving-school packages (TDC + practical) around ₱3,000–6,500. Each station on the left shows its own fee.";
  const node = NODES.find(n => t.includes(n.title.toLowerCase().split(" ")[0]));
  if (node) return `${node.title}: ${node.summary} Tap that station on the route panel — the form is already filled from your Digital National ID.`;
  const next = NODES.find(n => !done[n.id]);
  return next
    ? `Happy to help! If you’re on the driver’s-licence route, your next stop is “${next.title}” — see the panel on the left. Or tap a shortcut below for other services.`
    : "You’ve completed every station on the licence route! Ask me about any other government service, or tap a shortcut below.";
}

/* ── Workspace: route left, chat right ──────────────────────── */
function Workspace({ profile }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${cap(profile.first_name)}! I’m Ruta. Your identity is verified, so I can pre-fill any government form for you. Ask me anything — or tap a shortcut below. When you pick a goal, your step-by-step route appears on the left.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState({});
  const [routeShown, setRouteShown] = useState(false);
  const [active, setActive] = useState(null);
  const scroller = useRef(null);
  const initials = (profile.first_name[0] || "") + (profile.last_name[0] || "");

  useEffect(() => { scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages, busy]);

  function push(...msgs) { setMessages(m => [...m, ...msgs]); }

  function startRoute(withUserMsg) {
    if (routeShown) {
      const again = { role: "assistant", content: "Your driver’s-licence route is live on the left panel — tap the highlighted station to continue. 👈" };
      withUserMsg ? push(withUserMsg, again) : push(again);
      return;
    }
    setRouteShown(true);
    const intro = { role: "assistant", content: `Great goal, ${cap(profile.first_name)}! I’ve mapped your journey to a Non-Professional Driver’s Licence — see the route panel on the left. Six stations; tap each to see what’s needed and file it in place. Your verified ID fills the forms for you.` };
    withUserMsg ? push(withUserMsg, intro) : push(intro);
  }

  function handleFaq(faq) {
    if (busy) return;
    if (faq.kind === "route") {
      startRoute({ role: "user", content: faq.ask });
    } else {
      push({ role: "user", content: faq.ask }, { role: "assistant", content: faq.answer });
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    push({ role: "user", content: text });
    setInput(""); setBusy(true);

    const context = `User is ${profile.first_name} ${profile.last_name}, identity verified via Digital National ID (Once-Only Policy demo).
Layout: interactive route panel on the LEFT, this chat on the RIGHT.
Driver's-licence route ${routeShown ? "IS displayed on the left" : "is available (not started)"}: ${NODES.map((n, i) => `${i + 1}) ${n.title} (fee ${n.fee})`).join("; ")}.
Completed stations: ${NODES.filter(n => done[n.id]).map(n => n.title).join(", ") || "none"}.`;

    try {
      const history = [...messages, { role: "user", content: text }]
        .filter(m => m.content)
        .slice(-8)
        .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are Ruta, a warm, concise copilot for Philippine government services (demo app). Answer questions about PH government processes practically in 2-5 sentences. If the question is about getting a driver's licence, refer them to the interactive route panel on the left. Do not invent exact fees beyond common public knowledge; when unsure, say so and suggest the official source. Context: ${context}`,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      push({ role: "assistant", content: reply || fallbackReply(text, done) });
    } catch {
      push({ role: "assistant", content: fallbackReply(text, done) });
    } finally { setBusy(false); }
  }

  function completeNode(node) {
    setDone(d => ({ ...d, [node.id]: true }));
    setActive(null);
    const idx = NODES.findIndex(n => n.id === node.id);
    const next = NODES[idx + 1];
    push({
      role: "assistant",
      content: next
        ? `✅ “${node.title}” is done${node.type === "form" ? ` — your pre-filled application was filed (demo) and a confirmation SMS was sent to ${profile.mobile} via eMessage (demo)` : ""}. Next stop unlocked on the left: “${next.title}”.`
        : `🎉 That was the last station — route complete! You’ve gone from zero to a Non-Professional Driver’s Licence. A confirmation SMS was sent to ${profile.mobile} via eMessage (demo). Ask me about any other government service next.`,
    });
  }

  return (
    <div className="ruta" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      <header style={{ borderBottom: "1px solid var(--line)", background: "#fff", flex: "0 0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
          <Logo />
          <span className="chip">
            <span className="avatar">{initials}</span>
            {cap(profile.first_name)} {cap(profile.last_name)}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--ok)", fontSize: 11.5, fontWeight: 700 }}>
              <BadgeCheck size={13} /> Verified
            </span>
          </span>
        </div>
      </header>

      <div className="split">
        {/* LEFT: route panel */}
        <aside className="route-pane">
          <RoutePane routeShown={routeShown} done={done} onOpen={setActive} onStartRoute={() => startRoute(null)} />
        </aside>

        {/* RIGHT: chat */}
        <section className="chat-pane">
          <div ref={scroller} style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((m, i) => (
                <div className="msg" key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", display: "flex", gap: 10 }}>
                  {m.role === "assistant" && (
                    <span style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "50%", background: "#EAF0FB", display: "grid", placeItems: "center", marginTop: 2 }}>
                      <Sparkles size={14} color="var(--route)" />
                    </span>
                  )}
                  <div style={{
                    background: m.role === "user" ? "var(--route)" : "#fff",
                    border: m.role === "user" ? "none" : "1px solid var(--line)",
                    color: m.role === "user" ? "#fff" : "var(--ink)",
                    padding: "11px 14px", borderRadius: 14, fontSize: 14.5, whiteSpace: "pre-wrap",
                    borderTopRightRadius: m.role === "user" ? 4 : 14, borderTopLeftRadius: m.role === "user" ? 14 : 4,
                  }}>{m.content}</div>
                </div>
              ))}
              {busy && (
                <div className="msg" style={{ alignSelf: "flex-start", color: "var(--muted)", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#EAF0FB", display: "grid", placeItems: "center" }}>
                    <Sparkles size={14} color="var(--route)" />
                  </span>
                  <Loader2 size={14} className="spin" /> Ruta is thinking…
                </div>
              )}
            </div>
          </div>

          {/* Composer + FAQ chips */}
          <div style={{ flex: "0 0 auto", borderTop: "1px solid var(--line)", background: "#fff" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "10px 20px 14px" }}>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                {FAQS.map(f => (
                  <button className="mini-chip" key={f.id} onClick={() => handleFaq(f)}>
                    <f.icon size={13} color="var(--route)" /> {f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Ask Ruta anything about government services…"
                  style={{ flex: 1, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, font: "inherit", fontSize: 14.5 }} />
                <button className="btn btn-primary" onClick={send} disabled={busy || !input.trim()} aria-label="Send"><Send size={16} /></button>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
                Demo — answers are informational; agency submissions are simulated. Powered by eGov AI (concept).
              </div>
            </div>
          </div>
        </section>
      </div>

      {active && <NodeModal node={active} onClose={() => setActive(null)} onComplete={completeNode} />}
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("landing");
  const [profile, setProfile] = useState(null);

  if (view === "landing") return <Landing onStart={() => setView("auth")} />;
  if (view === "auth") return <Auth onVerified={(p) => { setProfile(p); setView("chat"); }} />;
  return <Workspace profile={profile} />;
}

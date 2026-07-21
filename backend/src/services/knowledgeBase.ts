import { computeSummary, nodeById, orderedNodes, RoadmapNode } from "./roadmap";

/**
 * Offline knowledge base for the copilot: hardcoded answers to the permits
 * and certificates citizens most commonly ask about. Used whenever the
 * Anthropic API is not configured or fails, so the chat always answers.
 *
 * Driver's-license answers are BUILT FROM the roadmap definition (single
 * source of truth), so fees and steps always match the route panel.
 *
 * Matching is first-hit-wins: named services come first, then the
 * driver's-license sub-topics, then generic cost/duration/overview keywords —
 * so "marriage license" hits marriage, not the driver's-license overview.
 */

interface Topic {
  id: string;
  keywords: string[];
  answer: string;
}

function feeLabel(fee: number): string {
  return fee > 0 ? `₱${fee.toLocaleString("en-PH")}` : "Free";
}

function nodeAnswer(nodeId: string, extra?: string): string {
  const node = nodeById(nodeId) as RoadmapNode;
  return [
    `**${node.title}** (Step ${node.order} on your route) — ${node.description}`,
    `**You'll need:**\n${node.requirements.map((r) => `- ${r}`).join("\n")}`,
    `**How it goes:**\n${node.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    `**Fee:** ${feeLabel(node.fee_php)} · est. ${node.duration_weeks} ${
      node.duration_weeks === 1 ? "week" : "weeks"
    }.${extra ? ` ${extra}` : ""}`,
    "Tap this station on the route panel to file it — your verified ID pre-fills the form.",
  ].join("\n\n");
}

const summary = computeSummary(orderedNodes);

const costAnswer = [
  "Here's the full cost of your driver's-license route:",
  orderedNodes.map((n) => `- ${n.title}: ${feeLabel(n.fee_php)}`).join("\n"),
  `**Total: ₱${summary.total_fee_php.toLocaleString("en-PH")}** (demo estimates). Each station on the left shows its own fee.`,
].join("\n\n");

const durationAnswer = [
  `End to end, plan for about **${summary.total_weeks_estimate} weeks** and **${summary.office_visits} office visits**:`,
  orderedNodes
    .map(
      (n) =>
        `- ${n.title}: ~${n.duration_weeks} ${n.duration_weeks === 1 ? "week" : "weeks"}${
          n.office_visit ? " (office visit)" : ""
        }`
    )
    .join("\n"),
  "The pacing item to remember: you must hold your Student Permit at least 30 days before taking the license exams.",
].join("\n\n");

const overviewAnswer = [
  "Your driver's-license journey is the interactive **route panel on the left** — six stations:",
  orderedNodes.map((n) => `${n.order}. ${n.title} (${feeLabel(n.fee_php)})`).join("\n"),
  `Total about ₱${summary.total_fee_php.toLocaleString("en-PH")}, est. ${summary.total_weeks_estimate} weeks, ${summary.office_visits} office visits. Tap the highlighted station to see what's needed and file it in place — your verified ID pre-fills every form.`,
].join("\n\n");

const TOPICS: Topic[] = [
  // ── Named services first (so e.g. "marriage license" never hits the DL overview) ──
  {
    id: "marriage_certificate",
    keywords: ["marriage", "wedding", "kasal", "cenomar"],
    answer:
      "For a PSA **marriage** certificate:\n\n1. Get a marriage license first at the Local Civil Registrar (LCR) where either of you resides — bring PSA birth certificates, CENOMAR, valid IDs, and (if 18–25) parental consent/advice. There's a 10-day posting period.\n2. Marry within 120 days of the license issue.\n3. The solemnizing officer files the certificate with the LCR, which endorses it to the PSA.\n4. After ~1–3 months, request the PSA copy online (PSAHelpline/PSASerbilis) or at any PSA outlet — about ₱155 per copy walk-in.",
  },
  {
    id: "sss_number",
    keywords: ["sss", "social security"],
    answer:
      "Getting your **SSS** number is fully online and free:\n\n1. Go to the SSS website → \"No SS Number yet? Apply online.\"\n2. Fill in your details and check your email for the continuation link.\n3. Upload a supporting document (PSA birth certificate or valid ID).\n4. Your SS number arrives by email — print the transaction slip.\n5. Register on My.SSS to start posting contributions.",
  },
  {
    id: "passport",
    keywords: ["passport", "dfa"],
    answer:
      "First-time Philippine **passport**:\n\n1. Book an appointment at passport.gov.ph (new slots open 9 PM daily).\n2. Pay ₱950 (regular, ~12 working days) or ₱1,200 (expedited, ~6).\n3. Appear at the DFA site with your PSA birth certificate and one valid government ID — your PhilID counts.\n4. Biometrics and photo are captured on-site; claim it or have it delivered.",
  },
  {
    id: "national_id",
    keywords: ["national id", "philid", "philsys", "ephilid"],
    answer:
      "To replace a lost **PhilID** (National ID):\n\n1. Execute a notarized Affidavit of Loss.\n2. Book a replacement at a PhilSys registration center or PHLPost — bring the affidavit and a supporting ID.\n3. Pay the ₱100 replacement fee (first issuance was free; replacement isn't).\n4. Your biometrics are re-verified against your PhilSys record.\n\nMeanwhile, your Digital National ID in the eGovPH app and your printable ePhilID remain usable.",
  },
  {
    id: "birth_certificate",
    keywords: ["birth certificate", "psa copy", "live birth"],
    answer:
      "For a PSA **birth certificate** copy:\n\n1. Order online via PSAHelpline.ph or PSASerbilis (delivered in ~3–7 working days), or\n2. Walk in at any PSA Civil Registry System outlet — bring a valid ID; about ₱155 per copy (online orders cost a bit more with delivery).\n3. If the record is missing or has errors, visit the Local Civil Registrar where the birth was registered for late registration or correction (RA 9048).",
  },
  {
    id: "nbi_clearance",
    keywords: ["nbi"],
    answer:
      "For an **NBI** clearance:\n\n1. Register and book at clearance.nbi.gov.ph.\n2. Pay ₱130 + e-payment service fee via the listed channels.\n3. Appear at your chosen NBI center for biometrics and photo.\n4. If you get a \"HIT\", return on the advised date for verification; otherwise the clearance releases same day.\n\nRenewals with no changes can use the NBI Clearance Quick Renewal delivery service.",
  },
  {
    id: "police_clearance",
    keywords: ["police clearance", "pnp"],
    answer:
      "For a **police** clearance (PNP National Police Clearance):\n\n1. Register at pnpclearance.ph and book an appointment at a police station.\n2. Pay ₱160 + service fee via the listed e-payment channels.\n3. Appear with two valid IDs for photo and biometrics — release is usually same day.",
  },
  {
    id: "barangay_clearance",
    keywords: ["barangay", "cedula", "community tax"],
    answer:
      "For a **barangay** clearance or cedula:\n\n1. Go to your barangay hall with a valid ID and proof of residency.\n2. Fill out the request slip and pay the small fee (commonly ₱20–100, varies per barangay).\n3. The cedula (Community Tax Certificate) is issued at the barangay or city/municipal treasurer — bring your TIN and income details.\n\nBoth usually release on the spot.",
  },
  {
    id: "tin",
    keywords: ["tin", "bir", "tax identification"],
    answer:
      "To get a **TIN** from the **BIR**:\n\n1. Employees: your employer usually processes BIR Form 1902 for you.\n2. Self-employed/mixed income: file BIR Form 1901 at the Revenue District Office covering your address.\n3. One-time taxpayers or E.O. 98 (e.g., needing a TIN for a government transaction): BIR Form 1904, or try the BIR Online Registration and Update System (ORUS).\n\nA TIN is free and you may only ever have one — getting a second is penalized.",
  },
  {
    id: "philhealth",
    keywords: ["philhealth"],
    answer:
      "For **PhilHealth** membership:\n\n1. Register online via the PhilHealth Member Portal or at any Local Health Insurance Office with a filled PMRF form and valid ID.\n2. You'll get a PhilHealth Identification Number (PIN) and can request your ID card.\n3. Employees are enrolled by their employer; self-employed members pay quarterly contributions.\n\nUnder Universal Health Care, every Filipino is automatically eligible — registering just activates your records.",
  },
  {
    id: "pagibig",
    keywords: ["pag-ibig", "pagibig", "hdmf"],
    answer:
      "For **Pag-IBIG** (HDMF) membership:\n\n1. Register at the Virtual Pag-IBIG website to get your Membership ID (MID) number.\n2. Employees are remitted by their employer; voluntary members can pay via Virtual Pag-IBIG, partner outlets, or GCash/Maya.\n3. After 24 monthly savings you qualify for the Multi-Purpose Loan; housing loans have their own requirements.\n\nGet your Loyalty Card Plus at any branch for discounts and as a valid ID.",
  },
  {
    id: "voters_registration",
    keywords: ["voter", "comelec", "botante"],
    answer:
      "For **COMELEC** voter's registration:\n\n1. Check the current registration period on comelec.gov.ph (registration pauses before elections).\n2. Book or walk in at the Office of the Election Officer where you reside — bring one valid ID with your address.\n3. Fill out the application and have your biometrics captured.\n4. Your record is approved by the Election Registration Board; you can verify status via COMELEC's precinct finder.",
  },
  {
    id: "postal_id",
    keywords: ["postal id", "phlpost"],
    answer:
      "For a **postal** ID (PHLPost):\n\n1. Go to any post office with two copies of the application form.\n2. Bring proof of identity (PSA birth certificate or valid ID) and proof of address (barangay certificate or utility bill).\n3. Pay ₱504 (regular, ~10–15 working days in Metro Manila) — the ID is delivered to your address.\n\nThe improved Postal ID is accepted as a valid government ID almost everywhere.",
  },
  {
    id: "business_permit",
    keywords: ["business", "dti", "mayor's permit", "sec registration"],
    answer:
      "To register a small **business**:\n\n1. Register the business name with DTI (sole proprietor, via bnrs.dti.gov.ph) or SEC (corporation/partnership).\n2. Get a barangay clearance where the business is located.\n3. Apply for the Mayor's/Business Permit at city hall — many LGUs now have online Business One-Stop Shops.\n4. Register with the BIR (Form 1901/1903) for your Certificate of Registration, invoices, and books of accounts.\n5. If hiring, register as an employer with SSS, PhilHealth, and Pag-IBIG.",
  },

  // ── Driver's-license sub-topics, built from the roadmap definition ──
  {
    id: "dl_medical",
    keywords: ["medical"],
    answer: nodeAnswer("medical_certificate"),
  },
  {
    id: "dl_tdc",
    keywords: ["tdc", "theoretical"],
    answer: nodeAnswer("theoretical_driving_course"),
  },
  {
    id: "dl_pdc",
    keywords: ["pdc", "practical"],
    answer: nodeAnswer(
      "practical_driving_course",
      "Remember: your Student Permit must be held at least 30 days before the license exams."
    ),
  },
  {
    id: "dl_student_permit",
    keywords: ["student permit", "permit"],
    answer: nodeAnswer(
      "student_permit",
      "After this, hold the permit at least 30 days while finishing your practical course."
    ),
  },
  {
    id: "dl_exams",
    keywords: ["exam", "written", "non-pro", "nonpro"],
    answer: nodeAnswer("nonpro_license_exam"),
  },
  {
    id: "dl_release",
    keywords: ["license release", "claim my license", "release"],
    answer: nodeAnswer("license_release"),
  },
  {
    id: "dl_cost",
    keywords: ["cost", "fee", "how much", "magkano", "price", "total", "expensive"],
    answer: costAnswer,
  },
  {
    id: "dl_duration",
    keywords: ["how long", "gaano", "duration", "weeks", "tagal", "timeline"],
    answer: durationAnswer,
  },
  {
    id: "dl_overview",
    keywords: ["driver", "driving", "license", "lto", "lisensya"],
    answer: overviewAnswer,
  },
];

const UNAVAILABLE_MESSAGE =
  "That topic **isn't in my offline knowledge yet**. I can currently help with: the driver's license route (left panel — steps, fees, timeline), marriage certificates, SSS, passports, National ID replacement, PSA birth certificates, NBI and police clearances, barangay clearance/cedula, TIN (BIR), PhilHealth, Pag-IBIG, voter's registration, postal ID, and business permits.\n\nTap a shortcut below or ask about one of those.";

export interface KnowledgeBaseAnswer {
  text: string;
  matched: boolean;
  /** Matched topic id (dl_* ids are driver's-license topics), null if unmatched. */
  topic: string | null;
}

export function answerFromKnowledgeBase(prompt: string): KnowledgeBaseAnswer {
  const normalized = prompt.toLowerCase();
  for (const topic of TOPICS) {
    if (topic.keywords.some((keyword) => normalized.includes(keyword))) {
      return { text: topic.answer, matched: true, topic: topic.id };
    }
  }
  return { text: UNAVAILABLE_MESSAGE, matched: false, topic: null };
}

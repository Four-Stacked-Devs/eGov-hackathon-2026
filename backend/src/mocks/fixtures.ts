export const FIXTURE_EVERIFY_PROFILE = {
  code: "AAA000",
  full_name: "JUAN SANTOS DELA CRUZ",
  first_name: "JUAN",
  middle_name: "SANTOS",
  last_name: "DELA CRUZ",
  suffix: null,
  gender: "Male",
  marital_status: "Single",
  blood_type: "A",
  email: "N/A",
  mobile_number: "639090000000",
  birth_date: "1990-01-01",
  full_address: "123 Sample Street, Sample Barangay, Sample City, Sample Province, Philippines, 1000"
};

export const FIXTURE_SSO_PROFILE = {
  first_name: "Juan",
  middle_name: "Santos",
  last_name: "Dela Cruz",
  birth_date: "1990-01-01",
  email: "juan.delacruz@example.ph",
  mobile_number: "+639090000000",
  full_address: "123 Sample Street, Sample Barangay, Sample City, Philippines, 1000"
};

export const FIXTURE_AI_REPLIES: Record<string, string> = {
  default:
    "For your driver's license journey, always bring your Digital National ID. Each step on your roadmap lists the exact requirements and fees — tap a step to see details.",
  medical:
    "For the **medical certificate**, visit an LTO-accredited clinic with a valid government ID. The exam covers vision, hearing, and a basic physical, and typically costs around ₱500. The result is transmitted electronically to LTO.",
  cost:
    "Your estimated total is **₱4,835**: medical ₱500, TDC free at LTO centers, student permit ₱250, practical driving course ~₱3,500, and license/exam fees ₱585.",
  permit:
    "After your **student permit**, hold it for at least 30 days while completing an 8-hour practical driving course. Then you can apply for the Non-Professional license exams."
};

// AI mock router: prompt includes "medical" → medical; "cost"|"much" → cost;
// "permit"|"after" → permit; else default.
export function mockAiReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("medical")) return FIXTURE_AI_REPLIES.medical as string;
  if (p.includes("cost") || p.includes("much")) return FIXTURE_AI_REPLIES.cost as string;
  if (p.includes("permit") || p.includes("after")) return FIXTURE_AI_REPLIES.permit as string;
  return FIXTURE_AI_REPLIES.default as string;
}

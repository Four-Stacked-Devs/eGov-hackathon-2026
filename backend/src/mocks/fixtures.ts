export const FIXTURE_EVERIFY_PROFILE = {
  code: "AAA000",
  full_name: "KEITH JUSTIN LEYNES NARIO",
  first_name: "KEITH JUSTIN",
  middle_name: "LEYNED",
  last_name: "NARIO",
  suffix: null,
  gender: "Male",
  marital_status: "Single",
  blood_type: "A",
  email: "nariokeithjustin12@gmail.com",
  mobile_number: "639566322071",
  birth_date: "2005-12-09",
  full_address: "123 Sample Street, Sample Barangay, Sample City, Sample Province, Philippines, 1000"
};

/**
 * The offline/mock fallback only ever verifies the one demo identity above —
 * any other typed details are rejected exactly like a real PhilSys mismatch,
 * so the demo can't be tricked into "verifying" arbitrary people.
 */
/**
 * Date pickers display MM/DD vs DD/MM depending on locale, so the demo
 * identity's birth date is also accepted with month and day swapped.
 */
function birthDateVariants(iso: string): string[] {
  const parts = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return [iso.trim()];
  const [, year, month, day] = parts;
  return month === day
    ? [`${year}-${month}-${day}`]
    : [`${year}-${month}-${day}`, `${year}-${day}-${month}`];
}

export function matchesEverifyFixture(details: {
  first_name: string;
  last_name: string;
  birth_date: string;
}): boolean {
  const norm = (value: string) => value.trim().toUpperCase();
  return (
    norm(details.first_name) === norm(FIXTURE_EVERIFY_PROFILE.first_name) &&
    norm(details.last_name) === norm(FIXTURE_EVERIFY_PROFILE.last_name) &&
    birthDateVariants(details.birth_date).includes(FIXTURE_EVERIFY_PROFILE.birth_date)
  );
}

export const FIXTURE_SSO_PROFILE = {
  first_name: "Keith Justin",
  middle_name: "Leyned",
  last_name: "Nario",
  birth_date: "2005-12-09",
  email: "nariokeithjustin12@gmail.com",
  mobile_number: "+639566322071",
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

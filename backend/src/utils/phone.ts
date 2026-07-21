/**
 * Bridges eVerify's mobile_number format ("639090000000") to the E.164
 * format eMessage requires ("+639090000000").
 * Returns null when no valid PH mobile number can be derived — the caller
 * must skip the SMS and log a warning.
 */
export function toE164(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed === "" || trimmed.toUpperCase() === "N/A") return null;
  if (/^\+639\d{9}$/.test(trimmed)) return trimmed;
  if (/^639\d{9}$/.test(trimmed)) return `+${trimmed}`;
  if (/^09\d{9}$/.test(trimmed)) return `+63${trimmed.slice(1)}`;
  return null;
}

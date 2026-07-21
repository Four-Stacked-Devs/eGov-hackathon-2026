import axios from "axios";
import { env } from "../env";

/**
 * Standalone Face Liveness REST API — used ONLY as a server-side diagnostic
 * pre-check on the SDK's session before the eVerify identity query. It never
 * replaces the SDK → eVerify chain (standalone sessions aren't accepted by
 * eVerify /api/query).
 */

function client() {
  return axios.create({
    baseURL: env.FACE_LIVENESS_BASE_URL,
    timeout: 5000,
    headers: { "x-api-key": env.FACE_LIVENESS_API_KEY as string },
  });
}

export function livenessConfigured(): boolean {
  return Boolean(env.FACE_LIVENESS_BASE_URL && env.FACE_LIVENESS_API_KEY);
}

const PASS_WORDS = ["completed", "passed", "success", "succeeded", "live"];
const FAIL_WORDS = ["failed", "rejected", "spoof", "not_live", "expired"];
const BOOL_KEYS = ["passed", "success", "is_live", "live", "verified"];
const STATUS_KEYS = ["status", "result", "state", "outcome"];
const NEST_KEYS = ["data", "result"];

/** Best-effort read of an undocumented liveness result body. */
export function interpretLivenessResult(body: unknown, depth = 0): boolean | null {
  if (depth > 3 || !body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  for (const key of BOOL_KEYS) {
    if (typeof obj[key] === "boolean") return obj[key] as boolean;
  }
  for (const key of STATUS_KEYS) {
    const value = obj[key];
    if (typeof value === "string") {
      const lowered = value.toLowerCase();
      if (FAIL_WORDS.some((w) => lowered.includes(w))) return false;
      if (PASS_WORDS.some((w) => lowered.includes(w))) return true;
    }
  }
  for (const key of NEST_KEYS) {
    const nested = interpretLivenessResult(obj[key], depth + 1);
    if (nested !== null) return nested;
  }
  return null;
}

/**
 * Diagnostic probe — never throws. A 404/invalid-token answer (the signal
 * that SDK session ids aren't accepted here) comes back as passed: null.
 */
export async function getLivenessResult(
  sessionToken: string
): Promise<{ passed: boolean | null; raw: unknown }> {
  try {
    const res = await client().get(`/v1/liveness/result/${encodeURIComponent(sessionToken)}`);
    return { passed: interpretLivenessResult(res.data), raw: res.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { passed: null, raw: { http_status: err.response.status, body: err.response.data } };
    }
    return {
      passed: null,
      raw: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}

/**
 * Creates a standalone liveness session (response carries a "token").
 * Available for credential probing — NOT part of the citizen flow.
 */
export async function createLivenessSession(): Promise<{ token: string | null; raw: unknown }> {
  try {
    const res = await client().post("/v1/liveness/session", {});
    const body = res.data as Record<string, unknown> | null;
    const token =
      body && typeof body === "object"
        ? typeof body.token === "string"
          ? body.token
          : typeof (body.data as Record<string, unknown> | undefined)?.token === "string"
            ? ((body.data as Record<string, unknown>).token as string)
            : null
        : null;
    return { token, raw: res.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { token: null, raw: { http_status: err.response.status, body: err.response.data } };
    }
    return { token: null, raw: { error: err instanceof Error ? err.message : String(err) } };
  }
}

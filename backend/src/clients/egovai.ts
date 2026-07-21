import axios from "axios";
import { env } from "../env";
import { TokenManager } from "../services/tokenManager";

const http = axios.create({ baseURL: env.EGOVAI_BASE_URL, timeout: 5000 });

interface AiTokenResponse {
  access_token: string;
  expires_in_seconds: number; // 28800 = 8 hours
  credits_total: number; // team has 200 total
  credits_remaining: number;
}

let creditsRemaining: number | null = null;

export function lastKnownCredits(): number | null {
  return creditsRemaining;
}

export const egovaiTokens = new TokenManager("egovai", async () => {
  const res = await http.post<AiTokenResponse>("/api/v1/egov/integration/token", {
    access_code: env.EGOVAI_ACCESS_CODE,
  });
  creditsRemaining = res.data.credits_remaining;
  return {
    token: res.data.access_token,
    expiresAtMs: Date.now() + res.data.expires_in_seconds * 1000,
  };
});

// The hackathon docs do not document the generate/credits RESPONSE shapes —
// per the spec's rule, undocumented fields are typed unknown and parsed
// defensively here instead of assuming a schema.
function extractText(body: unknown, depth = 0): string | null {
  if (depth > 3) return null;
  if (typeof body === "string" && body.trim() !== "") return body;
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["text", "response", "answer", "message", "content", "result", "data"]) {
      const found = extractText(obj[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function extractCredits(body: unknown, depth = 0): number | null {
  if (depth > 3) return null;
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.credits_remaining === "number") return obj.credits_remaining;
    for (const key of ["data", "result"]) {
      const found = extractCredits(obj[key], depth + 1);
      if (found !== null) return found;
    }
  }
  return null;
}

export async function aiGenerate(
  prompt: string
): Promise<{ text: string; credits_remaining?: number }> {
  const call = async (): Promise<unknown> => {
    const token = await egovaiTokens.getToken();
    const res = await http.post(
      "/api/v1/egov/integration/ai_assistant/generate",
      { prompt, category: "PH" }, // "category" is ALWAYS exactly "PH"
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data as unknown;
  };
  let body: unknown;
  try {
    body = await call();
  } catch (err) {
    // 401 → refresh token ONCE, retry ONCE, then fail. Never loop.
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      egovaiTokens.invalidate();
      body = await call();
    } else {
      throw err;
    }
  }
  const text = extractText(body);
  if (!text) throw new Error("eGov AI returned a response with no recognizable text field");
  const credits = extractCredits(body);
  if (credits !== null) {
    creditsRemaining = credits;
    console.log(`[egovai] credits_remaining: ${credits}`);
  }
  return credits !== null ? { text, credits_remaining: credits } : { text };
}

/**
 * Proxies the credits endpoint ONLY when a cached token exists —
 * never mints a token just to check credits.
 */
export async function aiCredits(): Promise<number | "unknown"> {
  if (!egovaiTokens.hasCachedToken()) return creditsRemaining ?? "unknown";
  try {
    const token = await egovaiTokens.getToken();
    const res = await http.get("/api/v1/egov/integration/credits", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const credits = extractCredits(res.data);
    if (credits !== null) {
      creditsRemaining = credits;
      return credits;
    }
  } catch (err) {
    console.error("[egovai] credits check failed:", err instanceof Error ? err.message : err);
  }
  return creditsRemaining ?? "unknown";
}

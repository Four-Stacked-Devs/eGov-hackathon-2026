import axios from "axios";
import { env } from "../env";
import { TokenManager } from "../services/tokenManager";

const http = axios.create({ baseURL: env.EVERIFY_BASE_URL, timeout: 5000 });

interface EverifyAuthResponse {
  data: {
    access_token: string;
    token_type: string;
    expires_at: string; // UNIX epoch string
  };
}

export const everifyTokens = new TokenManager("everify", async () => {
  const res = await http.post<EverifyAuthResponse>("/api/auth", {
    client_id: env.EVERIFY_CLIENT_ID,
    client_secret: env.EVERIFY_CLIENT_SECRET,
  });
  return {
    token: res.data.data.access_token,
    expiresAtMs: Number(res.data.data.expires_at) * 1000,
  };
});

export interface EverifyQueryPayload {
  first_name: string;
  middle_name?: string; // OMIT the key if empty — never send ""
  last_name: string;
  suffix?: string; // OMIT if empty
  birth_date: string; // YYYY-MM-DD
  face_liveness_session_id: string; // UUID from eKYC SDK result.session_id
}

// Real responses have strayed from the documented contract (a 200 body whose
// data object carried no `code`), so every field is typed unknown and checked
// at runtime instead of trusted. token/reference/face_url stay backend-only.
export interface EverifyQueryData {
  code?: unknown;
  token?: unknown;
  reference?: unknown;
  face_url?: unknown;
  full_name?: unknown;
  first_name?: unknown;
  middle_name?: unknown;
  last_name?: unknown;
  suffix?: unknown;
  gender?: unknown;
  marital_status?: unknown;
  blood_type?: unknown;
  email?: unknown;
  mobile_number?: unknown;
  birth_date?: unknown;
  full_address?: unknown;
  [key: string]: unknown;
}

/** Unwraps the documented { data: {...} } envelope, tolerating its absence. */
export function extractQueryData(body: unknown): EverifyQueryData | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object") return obj.data as EverifyQueryData;
  return obj as EverifyQueryData;
}

/** Success check per spec: response code starts with "AAA". Safe on any shape. */
export function isVerified(data: EverifyQueryData): boolean {
  return typeof data.code === "string" && data.code.startsWith("AAA");
}

export async function everifyQuery(
  payload: EverifyQueryPayload
): Promise<EverifyQueryData> {
  const call = async (): Promise<EverifyQueryData> => {
    const token = await everifyTokens.getToken();
    const res = await http.post<unknown>("/api/query", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = extractQueryData(res.data);
    if (!data) throw new Error("eVerify /api/query returned an unparseable body");
    return data;
  };
  try {
    return await call();
  } catch (err) {
    // 401 → refresh token ONCE, retry ONCE, then fail. Never loop.
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      everifyTokens.invalidate();
      return call();
    }
    throw err;
  }
}

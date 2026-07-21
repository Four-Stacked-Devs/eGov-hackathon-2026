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

export interface EverifyQueryData {
  code: string;
  // Backend-only secrets — these must NEVER be returned to the frontend.
  token?: string;
  reference?: string;
  face_url?: string;
  full_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  gender: string | null;
  marital_status: string | null;
  blood_type?: string | null;
  email: string | null;
  mobile_number: string | null;
  birth_date: string;
  full_address: string | null;
  [key: string]: unknown;
}

export async function everifyQuery(
  payload: EverifyQueryPayload
): Promise<EverifyQueryData> {
  const call = async (): Promise<EverifyQueryData> => {
    const token = await everifyTokens.getToken();
    const res = await http.post<{ data: EverifyQueryData }>("/api/query", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
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

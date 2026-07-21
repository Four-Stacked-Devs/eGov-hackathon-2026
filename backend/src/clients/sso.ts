import axios from "axios";
import { env } from "../env";
import { TokenManager } from "../services/tokenManager";

const http = axios.create({ baseURL: env.SSO_BASE_URL, timeout: 5000 });

type SsoTokenResponse = { access_token: string } & Record<string, unknown>;

export const ssoTokens = new TokenManager("sso", async () => {
  const res = await http.post<SsoTokenResponse>("/api/token", {
    partner_code: env.SSO_PARTNER_CODE,
    partner_secret: env.SSO_PARTNER_SECRET,
  });
  // The SSO docs don't state a token lifetime — cache for 1h and rely on
  // the documented 401 refresh-once/retry-once path.
  return { token: res.data.access_token, expiresAtMs: Date.now() + 60 * 60 * 1000 };
});

export async function ssoAuthenticate(
  exchange_code: string
): Promise<Record<string, unknown>> {
  const call = async (): Promise<Record<string, unknown>> => {
    const token = await ssoTokens.getToken();
    const res = await http.post(
      "/api/partner/sso_authentication",
      { exchange_code },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data as Record<string, unknown>;
  };
  try {
    return await call();
  } catch (err) {
    // 401 → refresh partner token ONCE, retry ONCE, then fail. Never loop.
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      ssoTokens.invalidate();
      return call();
    }
    throw err;
  }
}

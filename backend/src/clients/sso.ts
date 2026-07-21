import axios from "axios";
import { env } from "../env";
import { TokenManager } from "../services/tokenManager";

const http = axios.create({ baseURL: env.SSO_BASE_URL, timeout: 5000 });

type SsoTokenResponse = { access_token: string } & Record<string, unknown>;

/**
 * The live hackathon SSO API rejects the documented { partner_code,
 * partner_secret } body with 422 "The scope field is required." — a field
 * the spec never mentions. The accepted value must come from the official
 * docs, so it's injected via SSO_SCOPE rather than guessed here.
 */
export function ssoTokenBody(
  partner_code: string,
  partner_secret: string,
  scope: string | undefined
): Record<string, string> {
  const body: Record<string, string> = { partner_code, partner_secret };
  if (scope && scope.trim() !== "") body.scope = scope;
  return body;
}

export const ssoTokens = new TokenManager("sso", async () => {
  const res = await http.post<SsoTokenResponse>(
    "/api/token",
    ssoTokenBody(env.SSO_PARTNER_CODE, env.SSO_PARTNER_SECRET, env.SSO_SCOPE)
  );
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

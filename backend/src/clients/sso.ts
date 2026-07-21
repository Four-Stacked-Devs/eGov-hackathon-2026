import axios from "axios";
import { env } from "../env";

const http = axios.create({ baseURL: env.SSO_BASE_URL, timeout: 5000 });

const DEFAULT_SCOPE = "SSO_AUTHENTICATION";

/**
 * Real contract (confirmed against the sandbox's own OpenAPI at
 * /docs/api-docs.json, which supersedes the build spec's two-step flow):
 * POST /api/token takes partner_code, partner_secret, scope AND the
 * citizen's exchange_code together, returning a ONE-TIME access token for
 * that sign-in — there is no cacheable partner token.
 */
export function ssoTokenBody(
  partner_code: string,
  partner_secret: string,
  exchange_code: string,
  scope: string | undefined
): Record<string, string> {
  return {
    partner_code,
    partner_secret,
    exchange_code,
    scope: scope && scope.trim() !== "" ? scope : DEFAULT_SCOPE,
  };
}

export async function ssoAuthenticate(
  exchange_code: string
): Promise<Record<string, unknown>> {
  const tokenRes = await http.post<{ access_token: string } & Record<string, unknown>>(
    "/api/token",
    ssoTokenBody(env.SSO_PARTNER_CODE, env.SSO_PARTNER_SECRET, exchange_code, env.SSO_SCOPE)
  );
  const profileRes = await http.post(
    "/api/partner/sso_authentication",
    {},
    { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
  );
  return profileRes.data as Record<string, unknown>;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; hint?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * The frontend only ever calls our own backend — never a government URL
 * directly. (Sole exception: the eKYC SDK script tag + window.eKYC().)
 */
export async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { ok: false, error: "Can't reach the HaviFlow server.", hint: "Is the backend running?" };
  }
}

export const apiGet = <T>(path: string): Promise<ApiResult<T>> => api<T>(path);

export const apiPost = <T>(path: string, body: unknown): Promise<ApiResult<T>> =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

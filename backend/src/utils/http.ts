import axios from "axios";

/**
 * Graceful-degradation trigger: a gov call that timed out or never reached
 * the server. HTTP error responses (4xx/5xx) are NOT degradation cases —
 * those surface as real errors.
 */
export function isNetworkOrTimeout(err: unknown): boolean {
  return axios.isAxiosError(err) && (err.code === "ECONNABORTED" || !err.response);
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

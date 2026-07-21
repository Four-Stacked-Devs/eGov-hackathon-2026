export interface MintResult {
  token: string;
  expiresAtMs: number;
}

/**
 * Caches a gov-service access token (currently used by eVerify).
 * Returns the cached token while it has ≥60s of life left; otherwise mints
 * via the service's documented endpoint. Concurrent callers await the same
 * in-flight mint (single-flight). Token values are never logged.
 */
export class TokenManager {
  private token: string | null = null;
  private expiresAtMs = 0;
  private inFlight: Promise<string> | null = null;

  constructor(
    private readonly service: string,
    private readonly mint: () => Promise<MintResult>
  ) {}

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAtMs - 60_000) return this.token;
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.mint()
      .then((result) => {
        this.token = result.token;
        this.expiresAtMs = result.expiresAtMs;
        const lifeS = Math.round((result.expiresAtMs - Date.now()) / 1000);
        console.log(`[token:${this.service}] minted, expires in ${lifeS}s`);
        return result.token;
      })
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }

  /** For the 401-retry path: drop the cached token so the next call re-mints. */
  invalidate(): void {
    this.token = null;
    this.expiresAtMs = 0;
  }

  hasCachedToken(): boolean {
    return this.token !== null && Date.now() < this.expiresAtMs;
  }

  status(): { cached: boolean; expires_in_s: number | null } {
    const cached = this.hasCachedToken();
    return {
      cached,
      expires_in_s: cached ? Math.round((this.expiresAtMs - Date.now()) / 1000) : null,
    };
  }
}

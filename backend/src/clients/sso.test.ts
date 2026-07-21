import { describe, expect, it } from "vitest";
import { ssoTokenBody } from "./sso";

describe("ssoTokenBody", () => {
  it("includes scope when one is configured", () => {
    const body = ssoTokenBody("code", "secret", "portal");
    expect(body).toEqual({ partner_code: "code", partner_secret: "secret", scope: "portal" });
  });

  it("omits the scope key entirely when not configured", () => {
    const body = ssoTokenBody("code", "secret", undefined);
    expect(body).toEqual({ partner_code: "code", partner_secret: "secret" });
    expect("scope" in body).toBe(false);
  });

  it("treats a blank scope as not configured", () => {
    expect("scope" in ssoTokenBody("code", "secret", "  ")).toBe(false);
  });
});

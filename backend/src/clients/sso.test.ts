import { describe, expect, it } from "vitest";
import { ssoTokenBody } from "./sso";

describe("ssoTokenBody", () => {
  it("sends all four fields the live /api/token requires", () => {
    expect(ssoTokenBody("code", "secret", "EXCH123", "SSO_AUTHENTICATION")).toEqual({
      partner_code: "code",
      partner_secret: "secret",
      exchange_code: "EXCH123",
      scope: "SSO_AUTHENTICATION",
    });
  });

  it("defaults scope to SSO_AUTHENTICATION when not configured", () => {
    expect(ssoTokenBody("code", "secret", "EXCH123", undefined).scope).toBe(
      "SSO_AUTHENTICATION"
    );
  });

  it("treats a blank configured scope as not configured", () => {
    expect(ssoTokenBody("code", "secret", "EXCH123", "  ").scope).toBe(
      "SSO_AUTHENTICATION"
    );
  });
});

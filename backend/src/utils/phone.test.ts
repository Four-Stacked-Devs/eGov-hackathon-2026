import { describe, expect, it } from "vitest";
import { toE164 } from "./phone";

describe("toE164", () => {
  it('converts "639090000000" to "+639090000000"', () => {
    expect(toE164("639090000000")).toBe("+639090000000");
  });

  it('converts "09090000000" to "+639090000000"', () => {
    expect(toE164("09090000000")).toBe("+639090000000");
  });

  it('keeps "+639090000000" as "+639090000000"', () => {
    expect(toE164("+639090000000")).toBe("+639090000000");
  });

  it('returns null for "N/A"', () => {
    expect(toE164("N/A")).toBeNull();
  });

  it('returns null for ""', () => {
    expect(toE164("")).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(toE164(undefined)).toBeNull();
  });
});

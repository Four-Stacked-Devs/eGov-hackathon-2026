import { describe, expect, it } from "vitest";
import { extractQueryData, isVerified } from "./everify";

describe("extractQueryData", () => {
  it("unwraps the documented { data: {...} } envelope", () => {
    expect(extractQueryData({ data: { code: "AAA000" } })).toEqual({ code: "AAA000" });
  });

  it("falls back to the top-level object when there is no data envelope", () => {
    expect(extractQueryData({ code: "AAA000" })).toEqual({ code: "AAA000" });
  });

  it("returns null for non-object bodies", () => {
    expect(extractQueryData(null)).toBeNull();
    expect(extractQueryData(undefined)).toBeNull();
    expect(extractQueryData("error")).toBeNull();
  });
});

describe("isVerified", () => {
  it("accepts codes starting with AAA", () => {
    expect(isVerified({ code: "AAA000" })).toBe(true);
  });

  it("accepts a profile-bearing response with a non-AAA code (live IDB375 case)", () => {
    expect(
      isVerified({
        code: "IDB375",
        full_name: "KEITH JUSTIN LEYNES NARIO",
        first_name: "KEITH JUSTIN",
        last_name: "NARIO",
        birth_date: "2005-09-12",
      })
    ).toBe(true);
  });

  it("rejects the live no-match shape { verified: false }", () => {
    expect(isVerified({ verified: false })).toBe(false);
  });

  it("rejects verified:false even when other fields are present", () => {
    expect(
      isVerified({ verified: false, first_name: "X", last_name: "Y", birth_date: "2000-01-01" })
    ).toBe(false);
  });

  it("rejects non-AAA codes without a profile", () => {
    expect(isVerified({ code: "BBB123" })).toBe(false);
  });

  it("rejects a missing code without crashing", () => {
    expect(isVerified({})).toBe(false);
    expect(isVerified({ message: "No record found" })).toBe(false);
  });

  it("rejects a non-string code without crashing", () => {
    expect(isVerified({ code: 123 })).toBe(false);
  });
});

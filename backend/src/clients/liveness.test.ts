import { describe, expect, it } from "vitest";
import { interpretLivenessResult } from "./liveness";

describe("interpretLivenessResult", () => {
  it.each([
    [{ passed: true }, true],
    [{ success: true }, true],
    [{ is_live: true }, true],
    [{ live: true }, true],
    [{ verified: true }, true],
    [{ status: "COMPLETED" }, true],
    [{ status: "PASSED" }, true],
    [{ result: "SUCCESS" }, true],
    [{ data: { status: "completed" } }, true],
  ])("reads %j as passed", (body, expected) => {
    expect(interpretLivenessResult(body)).toBe(expected);
  });

  it.each([
    [{ passed: false }, false],
    [{ success: false }, false],
    [{ is_live: false }, false],
    [{ verified: false }, false],
    [{ status: "FAILED" }, false],
    [{ result: "REJECTED" }, false],
    [{ data: { status: "failed" } }, false],
  ])("reads %j as failed", (body, expected) => {
    expect(interpretLivenessResult(body)).toBe(expected);
  });

  it("returns null for unknown shapes", () => {
    expect(interpretLivenessResult({})).toBeNull();
    expect(interpretLivenessResult({ status: "PENDING" })).toBeNull();
    expect(interpretLivenessResult({ message: "not found" })).toBeNull();
    expect(interpretLivenessResult("error")).toBeNull();
    expect(interpretLivenessResult(null)).toBeNull();
    expect(interpretLivenessResult(undefined)).toBeNull();
  });
});

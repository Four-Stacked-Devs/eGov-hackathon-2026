import { describe, expect, it } from "vitest";
import { FIXTURE_EVERIFY_PROFILE, matchesEverifyFixture } from "./fixtures";

const fixtureDetails = {
  first_name: FIXTURE_EVERIFY_PROFILE.first_name,
  last_name: FIXTURE_EVERIFY_PROFILE.last_name,
  birth_date: FIXTURE_EVERIFY_PROFILE.birth_date,
};

describe("matchesEverifyFixture", () => {
  it("accepts the fixture identity exactly", () => {
    expect(matchesEverifyFixture(fixtureDetails)).toBe(true);
  });

  it("accepts the fixture identity regardless of case and padding", () => {
    expect(
      matchesEverifyFixture({
        first_name: ` ${FIXTURE_EVERIFY_PROFILE.first_name.toLowerCase()} `,
        last_name: FIXTURE_EVERIFY_PROFILE.last_name.toLowerCase(),
        birth_date: FIXTURE_EVERIFY_PROFILE.birth_date,
      })
    ).toBe(true);
  });

  it("rejects a different name", () => {
    expect(
      matchesEverifyFixture({ ...fixtureDetails, last_name: "SOMEONE ELSE" })
    ).toBe(false);
  });

  it("rejects a different birth date", () => {
    expect(
      matchesEverifyFixture({ ...fixtureDetails, birth_date: "1999-01-01" })
    ).toBe(false);
  });

  it("accepts the fixture birth date with month and day swapped (date-picker ambiguity)", () => {
    const [year, month, day] = FIXTURE_EVERIFY_PROFILE.birth_date.split("-");
    expect(
      matchesEverifyFixture({ ...fixtureDetails, birth_date: `${year}-${day}-${month}` })
    ).toBe(true);
  });
});

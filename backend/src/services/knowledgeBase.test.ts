import { describe, expect, it } from "vitest";
import { answerFromKnowledgeBase } from "./knowledgeBase";

describe("answerFromKnowledgeBase", () => {
  it.each([
    ["How do I get an SSS number?", "SSS"],
    ["What's the process for getting a marriage certificate?", "marriage"],
    ["How do I apply for a passport for the first time?", "passport"],
    ["How do I replace a lost National ID?", "PhilID"],
    ["paano kumuha ng NBI clearance", "NBI"],
    ["How do I get a driver's license?", "route panel"],
    ["I need a PSA birth certificate", "birth certificate"],
    ["how to get a TIN from the BIR", "TIN"],
    ["PhilHealth registration", "PhilHealth"],
    ["pag-ibig membership", "Pag-IBIG"],
    ["how do I register as a voter", "COMELEC"],
    ["barangay clearance requirements", "barangay"],
    ["police clearance", "police"],
    ["how to get a postal id", "postal"],
    ["register a business permit", "business"],
  ])("answers %s from the knowledge base", (prompt, expectedFragment) => {
    const result = answerFromKnowledgeBase(prompt);
    expect(result.matched).toBe(true);
    expect(result.text.toLowerCase()).toContain(expectedFragment.toLowerCase());
  });

  it("is case-insensitive", () => {
    expect(answerFromKnowledgeBase("HOW TO GET AN SSS NUMBER").matched).toBe(true);
  });

  it("returns the unavailable message for unrelated questions", () => {
    const result = answerFromKnowledgeBase("1+1");
    expect(result.matched).toBe(false);
    expect(result.text).toContain("isn't in my offline knowledge yet");
  });
});

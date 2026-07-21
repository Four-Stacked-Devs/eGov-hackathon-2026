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

  it("catches semantic driving phrasings without the word 'driver'", () => {
    for (const prompt of [
      "I want to learn to drive a car, where do I start?",
      "can I legally drive a motorcycle?",
      "gusto ko matutong magmaneho",
    ]) {
      const result = answerFromKnowledgeBase(prompt);
      expect(result.topic?.startsWith("dl_"), prompt).toBe(true);
    }
  });

  it("matches on word boundaries — 'card' is not 'car', 'waiting' is not 'tin'", () => {
    expect(answerFromKnowledgeBase("replace my national id card").topic).toBe("national_id");
    expect(answerFromKnowledgeBase("I am waiting for something unrelated").matched).toBe(false);
  });

  describe("driver's license sub-topics (built from the roadmap definition)", () => {
    it("answers medical certificate questions with the real node data", () => {
      const result = answerFromKnowledgeBase("What do I need for the medical certificate?");
      expect(result.matched).toBe(true);
      expect(result.text).toContain("Medical Certificate");
      expect(result.text).toContain("₱500");
      expect(result.text).toContain("LTO-accredited");
    });

    it("answers TDC questions", () => {
      const result = answerFromKnowledgeBase("what is the theoretical driving course?");
      expect(result.text).toContain("Theoretical Driving Course");
      expect(result.text).toContain("15-hour");
    });

    it("answers student permit questions", () => {
      const result = answerFromKnowledgeBase("how do I get my student permit?");
      expect(result.text).toContain("Student Permit");
      expect(result.text).toContain("₱250");
    });

    it("answers practical driving course questions", () => {
      const result = answerFromKnowledgeBase("tell me about the PDC");
      expect(result.text).toContain("Practical Driving Course");
    });

    it("answers exam questions", () => {
      const result = answerFromKnowledgeBase("what happens in the written exam?");
      expect(result.text).toContain("Non-Pro License Application & Exams");
    });

    it("answers cost questions with the computed total", () => {
      const result = answerFromKnowledgeBase("how much will everything cost?");
      expect(result.text).toContain("₱4,835");
      expect(result.text).toContain("₱3,500");
    });

    it("answers timeline questions with the computed estimate", () => {
      const result = answerFromKnowledgeBase("how long does the whole process take?");
      expect(result.text).toContain("6 weeks");
      expect(result.text).toContain("3");
    });

    it("keeps marriage license questions out of the driver's license overview", () => {
      expect(answerFromKnowledgeBase("how do I get a marriage license?").text).toContain(
        "marriage"
      );
    });
  });

  it("returns the unavailable message for unrelated questions", () => {
    const result = answerFromKnowledgeBase("1+1");
    expect(result.matched).toBe(false);
    expect(result.text).toContain("isn't in my offline knowledge yet");
  });
});

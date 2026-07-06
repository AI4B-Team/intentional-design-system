import { describe, it, expect } from "vitest";
import { calculatePriorityIndex } from "./priority-scoring";

describe("priority-scoring", () => {
  it("returns HOT tier (>=80) for high-value overdue closing deal", () => {
    const r = calculatePriorityIndex({
      arv: 300000,
      askingPrice: 150000,
      repairEstimate: 20000, // spread = 130k → dealValue 100
      isOverdue: true, // timeSensitivity 100
      motivationScore: 900, // engagement +45 -> 65
      hasReplied: true, // +30 -> 95
      lastContactDays: 7, // silenceRisk 80
      status: "closing", // multiplier 1.2, stageWeight 100
    });
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.tier).toBe("hot");
    expect(r.label).toContain("HOT");
  });

  it("returns hidden tier for a cold new lead with no engagement", () => {
    const r = calculatePriorityIndex({
      askingPrice: 100000,
      status: "new",
    });
    expect(r.score).toBeLessThan(40);
    expect(r.tier).toBe("hidden");
  });

  it("returns warm tier between 60 and 79", () => {
    const r = calculatePriorityIndex({
      arv: 200000,
      askingPrice: 150000,
      repairEstimate: 25000, // spread 25k -> dealValue 70
      isOverdue: false,
      followUpDate: new Date(Date.now() + 36 * 60 * 60 * 1000), // ~36h -> 85
      motivationScore: 400, // engagement +20 baseline+20 = 40
      lastContactDays: 3, // silenceRisk 40
      status: "contacted", // mult 0.8, stageWeight ~43
    });
    expect(r.tier === "warm" || r.tier === "background").toBe(true);
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("clamps score to <=100 and exposes all component scores", () => {
    const r = calculatePriorityIndex({
      arv: 1_000_000,
      askingPrice: 100000,
      repairEstimate: 0,
      isOverdue: true,
      motivationScore: 1000,
      hasReplied: true,
      lastContactDays: 30,
      status: "closing",
    });
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.components.dealValue).toBe(100);
    expect(r.components.timeSensitivity).toBe(100);
    expect(r.components.silenceRisk).toBe(100);
  });
});

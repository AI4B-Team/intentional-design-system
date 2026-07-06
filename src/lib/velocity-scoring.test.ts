import { describe, it, expect } from "vitest";
import { calculateVelocityScore } from "./velocity-scoring";

describe("velocity-scoring", () => {
  it("returns LOW when there are no urgency signals", () => {
    const r = calculateVelocityScore({});
    expect(r.score).toBe(0);
    expect(r.urgency_level).toBe("LOW");
    expect(r.factors).toEqual([]);
    expect(r.recommended_action).toMatch(/nurture/i);
  });

  it("returns CRITICAL (>=90) when competition + market + urgent seller stack", () => {
    const auction = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days out
    const r = calculateVelocityScore({
      other_investors_contacted: true,
      on_wholesaler_lists: true,
      multiple_recent_inquiries: true,
      competitor_activity_flagged: true,
      days_on_market: 10,
      area_avg_days_on_market: 45, // ratio 0.22 -> fast (+15)
      high_buyer_demand_area: true,
      fast_market_comps: true,
      auction_date: auction, // +20
      seller_mentioned_urgent: true, // +15
      foreclosure_advancing: true, // +15
      motivation_score: 900, // +10
      distress_signals: ["foreclosure"],
    });
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.urgency_level).toBe("CRITICAL");
    expect(r.deadline_type).toBe("Auction");
  });

  it("caps competition at 40, market at 25, seller urgency at 35 (total <=100)", () => {
    const r = calculateVelocityScore({
      other_investors_contacted: true,
      on_wholesaler_lists: true,
      multiple_recent_inquiries: true,
      competitor_activity_flagged: true,
      days_on_market: 5,
      area_avg_days_on_market: 45,
      high_buyer_demand_area: true,
      fast_market_comps: true,
      seller_mentioned_urgent: true,
      foreclosure_advancing: true,
      motivation_score: 900,
    });
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("STANDARD tier lands between 40 and 69", () => {
    const r = calculateVelocityScore({
      other_investors_contacted: true, // 20
      high_buyer_demand_area: true, // 10
      seller_mentioned_urgent: true, // 15
      motivation_score: 900, // 10
    });
    expect(r.score).toBeGreaterThanOrEqual(40);
    expect(r.score).toBeLessThan(70);
    expect(r.urgency_level).toBe("STANDARD");
  });
});

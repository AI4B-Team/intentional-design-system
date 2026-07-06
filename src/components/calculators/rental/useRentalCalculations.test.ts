import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRentalCalculations } from "./useRentalCalculations";
import { DEFAULT_RENTAL_INPUTS } from "./types";

describe("useRentalCalculations", () => {
  it("computes acquisition & financing math for standard mode", () => {
    const { result } = renderHook(() =>
      useRentalCalculations(DEFAULT_RENTAL_INPUTS, "standard"),
    );
    const r = result.current;
    // 20% of 185k = 37k down; loan = 148k
    expect(r.downPayment).toBe(37000);
    expect(r.loanAmount).toBe(148000);
    // Total cash: 37k + 4k + 25k = 66k
    expect(r.totalCashInvested).toBe(66000);
    // 30-year P&I on 148k @ 7% ≈ $984.60/mo
    expect(r.monthlyPI).toBeGreaterThan(980);
    expect(r.monthlyPI).toBeLessThan(990);
  });

  it("produces cap rate, cash-on-cash and DSCR in reasonable ranges", () => {
    const { result } = renderHook(() =>
      useRentalCalculations(DEFAULT_RENTAL_INPUTS, "standard"),
    );
    const r = result.current;
    // Cap rate = NOI / price * 100. NOI is positive here.
    expect(r.capRate).toBeGreaterThan(0);
    expect(r.capRate).toBeLessThan(20);
    // Cash-on-cash may be negative (thin deal) but should be a finite number.
    expect(Number.isFinite(r.cashOnCash)).toBe(true);
    // DSCR ratio must be non-negative.
    expect(r.dscr).toBeGreaterThanOrEqual(0);
    expect(r.dealScore).toBeGreaterThanOrEqual(0);
    expect(r.dealScore).toBeLessThanOrEqual(100);
  });

  it("evaluates the 1% and 2% rules against purchase price", () => {
    // Force 1% rule to pass (rent >= 1% price).
    const passOne = renderHook(() =>
      useRentalCalculations(
        { ...DEFAULT_RENTAL_INPUTS, purchasePrice: 100000, monthlyRent: 1200 },
        "standard",
      ),
    ).result.current;
    expect(passOne.onePercentRule).toBe(true);
    expect(passOne.twoPercentRule).toBe(false);

    // Fail both rules.
    const failBoth = renderHook(() =>
      useRentalCalculations(
        { ...DEFAULT_RENTAL_INPUTS, purchasePrice: 400000, monthlyRent: 1500 },
        "standard",
      ),
    ).result.current;
    expect(failBoth.onePercentRule).toBe(false);
    expect(failBoth.twoPercentRule).toBe(false);
  });

  it("switches to BRRRR figures in brrrr mode", () => {
    const { result } = renderHook(() =>
      useRentalCalculations(DEFAULT_RENTAL_INPUTS, "brrrr"),
    );
    // Refi loan = 240k * 75% = 180k; cash out = 180k - 148k = 32k
    expect(result.current.newLoanAmount).toBe(180000);
    expect(result.current.cashOut).toBe(32000);
    // Cash left = 66k invested - 32k = 34k
    expect(result.current.cashLeftInDeal).toBe(34000);
  });
});

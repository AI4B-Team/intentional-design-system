import { describe, it, expect } from "vitest";
import {
  checkCompliance,
  getComplianceScore,
  getComplianceStatus,
  type StateRegulation,
  type SellerFinanceTerms,
  type LeaseOptionTerms,
} from "./compliance";

function makeRegulation(overrides: Partial<StateRegulation> = {}): StateRegulation {
  return {
    id: "1",
    state_code: "TX",
    state_name: "Texas",
    max_interest_rate: null,
    usury_exemptions: null,
    seller_financing_restrictions: null,
    lease_option_restrictions: null,
    land_contract_restrictions: null,
    required_disclosures: [],
    licensing_requirements: null,
    foreclosure_type: null,
    redemption_period_days: null,
    notes: null,
    last_updated: "2025-01-01",
    ...overrides,
  };
}

describe("compliance", () => {
  it("passes a seller-finance deal in a state with no restrictions", () => {
    const reg = makeRegulation({ state_code: "AK", state_name: "Alaska" });
    const terms: SellerFinanceTerms = {
      interest_rate: 6,
      loan_amount: 150000,
    };
    const result = checkCompliance(reg, "seller_finance", terms);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    // Federal Dodd-Frank reminder is always attached as a warning.
    expect(result.warnings.some((w) => w.code === "DODD_FRANK_SAFE")).toBe(true);
  });

  it("flags a usury violation when the rate exceeds a state cap", () => {
    const reg = makeRegulation({
      state_code: "NY",
      state_name: "New York",
      max_interest_rate: 16,
    });
    const terms: SellerFinanceTerms = {
      interest_rate: 22,
      loan_amount: 100000,
    };
    const result = checkCompliance(reg, "seller_finance", terms);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.code === "USURY_VIOLATION")).toBe(true);
  });

  it("blocks California lease options exceeding 60 months", () => {
    const reg = makeRegulation({ state_code: "CA", state_name: "California" });
    const terms: LeaseOptionTerms = {
      option_term_months: 72,
      option_fee: 5000,
      monthly_rent: 2500,
      purchase_price: 400000,
    };
    const result = checkCompliance(reg, "lease_option", terms);
    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.code === "CA_OPTION_TERM_LIMIT")).toBe(true);
  });

  it("scores clean deals higher than violating ones", () => {
    const clean = checkCompliance(
      makeRegulation({ state_code: "AK", state_name: "Alaska" }),
      "seller_finance",
      { interest_rate: 6, loan_amount: 150000 },
    );
    const failing = checkCompliance(
      makeRegulation({ state_code: "NY", state_name: "New York", max_interest_rate: 16 }),
      "seller_finance",
      { interest_rate: 22, loan_amount: 100000 },
    );
    expect(getComplianceScore(clean)).toBeGreaterThan(getComplianceScore(failing));
    expect(getComplianceStatus(failing)).toBe("fail");
  });
});

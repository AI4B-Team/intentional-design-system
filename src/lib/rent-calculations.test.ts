import { describe, it, expect } from "vitest";
import {
  calculateEstimatedRent,
  calculateAvgRentPerSqft,
  formatRent,
} from "./rent-calculations";

describe("rent-calculations", () => {
  describe("calculateEstimatedRent", () => {
    it("uses default rent/sqft (1.25) when none given", () => {
      const r = calculateEstimatedRent(1000);
      expect(r.monthlyRent).toBe(1250);
      expect(r.rentPerSqft).toBe(1.25);
      expect(r.source).toBe("default");
    });

    it("uses comps rate when provided and rounds monthly rent", () => {
      const r = calculateEstimatedRent(1234, 1.5);
      expect(r.monthlyRent).toBe(1851); // 1234 * 1.5 = 1851
      expect(r.source).toBe("comps");
    });

    it("returns 0 for zero sqft", () => {
      expect(calculateEstimatedRent(0).monthlyRent).toBe(0);
    });
  });

  describe("calculateAvgRentPerSqft", () => {
    it("returns default when comps are empty", () => {
      expect(calculateAvgRentPerSqft([])).toBe(1.25);
    });

    it("averages comps", () => {
      const avg = calculateAvgRentPerSqft([
        { rentPerSqft: 1.0 },
        { rentPerSqft: 2.0 },
        { rentPerSqft: 3.0 },
      ]);
      expect(avg).toBe(2.0);
    });
  });

  describe("formatRent", () => {
    it("formats with thousands separator and /mo suffix", () => {
      expect(formatRent(1850)).toBe("$1,850/mo");
    });
  });
});

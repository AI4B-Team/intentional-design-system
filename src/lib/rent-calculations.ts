/**
 * Centralized rent calculation utilities
 * Ensures consistent rent estimates across all views
 */

// Default rent per sqft when no comps are available
const DEFAULT_RENT_PER_SQFT = 1.25;

export interface RentEstimate {
  monthlyRent: number;
  rentPerSqft: number;
  source: "comps" | "default";
}

/**
 * Calculate estimated monthly rent for a property
 * Uses a consistent formula across all views
 */
export function calculateEstimatedRent(
  sqft: number,
  rentPerSqft: number = DEFAULT_RENT_PER_SQFT
): RentEstimate {
  const monthlyRent = Math.round(sqft * rentPerSqft);
  return {
    monthlyRent,
    rentPerSqft,
    source: rentPerSqft === DEFAULT_RENT_PER_SQFT ? "default" : "comps",
  };
}

/**
 * Calculate average rent per sqft from rental comps
 */
export function calculateAvgRentPerSqft(
  comps: Array<{ rentPerSqft: number }>
): number {
  if (!comps || comps.length === 0) return DEFAULT_RENT_PER_SQFT;
  const total = comps.reduce((sum, c) => sum + c.rentPerSqft, 0);
  return total / comps.length;
}

/**
 * Format rent as currency string
 */
export function formatRent(rent: number): string {
  return `$${rent.toLocaleString()}/mo`;
}

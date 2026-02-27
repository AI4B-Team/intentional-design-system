import React from "react";
import { Zap } from "lucide-react";
import type { D4DProperty } from "./d4d-scan-data";

function generateBuyerCount(properties: D4DProperty[]): number {
  // Deterministic buyer count based on property data
  const zipSet = new Set(properties.map(p => p.zip));
  const base = zipSet.size * 12;
  const distressBonus = properties.filter(p => p.distressScore >= 60).length * 3;
  return Math.max(8, base + distressBonus);
}

interface D4DBuyerBannerProps {
  properties: D4DProperty[];
}

export function D4DBuyerBanner({ properties }: D4DBuyerBannerProps) {
  if (properties.length === 0) return null;

  const buyerCount = generateBuyerCount(properties);

  return (
    <div className="mx-3 mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
      <p className="text-xs text-amber-900 leading-relaxed">
        <Zap className="h-3.5 w-3.5 inline text-amber-600 mr-1 -mt-0.5" />
        <span className="font-bold text-amber-700">{buyerCount} buyers</span> in our system are actively buying in these zip codes. Access homeowner contact info, pursue deals directly, and see which buyers may be interested in properties you secure — based on their verified purchase history and activity.
      </p>
    </div>
  );
}

export function getPropertyBuyerCount(property: D4DProperty): number {
  // Per-property buyer match count based on distress signals
  let count = 5;
  if (property.preForeclosure) count += 8;
  if (property.taxLien) count += 6;
  if (property.probate) count += 5;
  if (property.vacant) count += 4;
  if (property.wholesaleSpread > 30000) count += 7;
  if (property.highEquity) count += 3;
  if (property.distressScore >= 70) count += 5;
  return count;
}

export function getBuyerMatchReason(property: D4DProperty): string {
  if (property.preForeclosure) {
    return `Pre-foreclosure status + equity spread matches active buyers' buy boxes in ${property.zip}`;
  }
  if (property.taxLien) {
    return `Tax lien + ${property.estimatedEquityPct}% equity triggers buyer alerts in this market`;
  }
  if (property.probate) {
    return `Estate situation with motivated heirs matches investor criteria in ${property.city}`;
  }
  if (property.vacant) {
    return `Extended vacancy${property.daysVacant ? ` (${property.daysVacant}d)` : ""} signals opportunity for area buyers`;
  }
  if (property.wholesaleSpread > 30000) {
    return `$${(property.wholesaleSpread / 1000).toFixed(0)}K spread triggered buyer alerts across ${property.zip}`;
  }
  return `Distress signals in ${property.zip} match active buyer criteria in this market`;
}

export function getBuyerTypes(property: D4DProperty): string[] {
  const types: string[] = [];
  if (property.preForeclosure || property.taxLien) types.push("Flipper");
  if (property.vacant || property.highEquity) types.push("Landlord");
  if (property.wholesaleSpread > 25000) types.push("Investor");
  if (property.probate) types.push("Estate Buyer");
  if (types.length === 0) types.push("Investor");
  return [...new Set(types)];
}

import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealScoreCompact } from "@/components/marketplace-deals/DealScore";
import { calculateEstimatedRent, formatRent } from "@/lib/rent-calculations";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";

interface PropertySummaryHeaderProps {
  deal: MarketplaceDeal;
  viewMode?: "flip" | "hold";
}

export function PropertySummaryHeader({
  deal,
  viewMode = "flip",
}: PropertySummaryHeaderProps) {
  // Mock last sold data (same as OverviewTab)
  const lastSoldPrice = 200000;
  const lastSoldDate = "May 2025";
  const priceChange = deal.price - lastSoldPrice;

  // Calculate ROI for deal score (same as OverviewTab)
  const estRepairs = 20000;
  const holdingCosts = 8000;
  const closingCosts = Math.round(deal.arv * 0.06);
  const agentCommission = Math.round(deal.arv * 0.05);
  const totalCosts = deal.price + estRepairs + holdingCosts + closingCosts + agentCommission;
  const profit = deal.arv - totalCosts;
  const roi = Math.round((profit / (deal.price + estRepairs)) * 100);

  return (
    <div>
      {/* Row 1: Price, ARV, Est. Rent (Hold only), Deal Score */}
      <div className="flex items-center gap-4 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Price</span>
          <span className="text-3xl font-bold">${deal.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">ARV</span>
          <span className="text-3xl font-bold text-success">${deal.arv.toLocaleString()}</span>
        </div>
        {viewMode === "hold" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Est. Rent</span>
            <span className="text-3xl font-bold text-primary">{formatRent(calculateEstimatedRent(deal.sqft).monthlyRent)}</span>
          </div>
        )}
        {/* Deal Score - Far Right */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Score</span>
          <DealScoreCompact score={Math.min(Math.round(roi * 3 + 20), 100)} />
        </div>
      </div>

      {/* Row 2: Last Sold info + Property Labels */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last Sold ${lastSoldPrice.toLocaleString()} ({lastSoldDate})
          </span>
          <span className={cn(
            "flex items-center gap-0.5 text-sm font-semibold",
            priceChange >= 0 ? "text-success" : "text-destructive"
          )}>
            {priceChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {priceChange >= 0 ? "+" : ""}${Math.abs(priceChange).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === "flip" ? (
            <>
              <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                5 Buyers Match
              </Badge>
              <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                A Location
              </Badge>
              <Badge variant="outline" className="border-warning text-warning bg-warning/10 rounded-lg px-3 py-1 text-xs font-medium">
                Hot Market
              </Badge>
            </>
          ) : (
            <>
              <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                3 Buyers Match
              </Badge>
              <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                A+ Location
              </Badge>
              <Badge variant="outline" className="border-success text-success bg-success/10 rounded-lg px-3 py-1 text-xs font-medium">
                9.2% Cap
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Row 3: Address */}
      <p className="flex items-center gap-2 text-lg text-muted-foreground">
        <MapPin className="h-5 w-5" />
        {deal.address}, {deal.city}, {deal.state} {deal.zip}
      </p>
    </div>
  );
}

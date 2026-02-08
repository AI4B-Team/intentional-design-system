import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";

interface PropertySummaryHeaderProps {
  deal: MarketplaceDeal;
  matchingBuyers?: number;
  locationGrade?: string;
  marketHeat?: "hot" | "warm" | "cold";
  score?: number;
}

export function PropertySummaryHeader({
  deal,
  matchingBuyers = 5,
  locationGrade = "A",
  marketHeat = "hot",
  score = 47,
}: PropertySummaryHeaderProps) {
  // Mock last sold data
  const lastSoldPrice = 200000;
  const lastSoldDate = "May 2025";
  const priceDrop = lastSoldPrice - deal.price;

  // Determine score color based on value
  const getScoreColor = () => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreStrokeColor = () => {
    if (score >= 70) return "hsl(var(--success))";
    if (score >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="bg-muted/30 rounded-lg border p-5 mb-6">
      <div className="flex items-start justify-between">
        {/* Left: Price & Property Info */}
        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-6 mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Price</span>
              <span className="text-3xl font-bold tracking-tight">${deal.price.toLocaleString()}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">ARV</span>
              <span className="text-3xl font-bold text-success tracking-tight">${deal.arv.toLocaleString()}</span>
            </div>
          </div>

          {/* Last Sold Info */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">
              Last Sold ${lastSoldPrice.toLocaleString()} ({lastSoldDate})
            </span>
            {priceDrop > 0 && (
              <span className="text-sm text-destructive flex items-center gap-1 font-medium">
                <TrendingDown className="h-3.5 w-3.5" />
                ${priceDrop.toLocaleString()}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {deal.address}, {deal.city}, {deal.state} {deal.zip}
            </span>
          </div>
        </div>

        {/* Right: Score + Badges */}
        <div className="flex flex-col items-end gap-3">
          {/* Score */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Score</span>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                {/* Background circle - dark */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="hsl(var(--foreground))"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={getScoreStrokeColor()}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 - (score / 100) * 2 * Math.PI * 24}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-background">{score}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background px-3 py-1.5 text-sm font-normal rounded-lg">
              {matchingBuyers} Buyers Match
            </Badge>
            <Badge variant="outline" className="bg-background px-3 py-1.5 text-sm font-normal rounded-lg">
              {locationGrade} Location
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1.5 text-sm font-normal rounded-lg",
                marketHeat === "hot" && "bg-success/10 text-success border-success",
                marketHeat === "warm" && "bg-warning/10 text-warning border-warning",
                marketHeat === "cold" && "bg-primary/10 text-primary border-primary"
              )}
            >
              {marketHeat === "hot" && "Hot Market"}
              {marketHeat === "warm" && "Warm Market"}
              {marketHeat === "cold" && "Cold Market"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

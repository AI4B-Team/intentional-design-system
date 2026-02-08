import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingDown } from "lucide-react";
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

  // Calculate score ring values
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine score color based on value
  const getScoreColor = () => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-orange-500";
  };

  const getScoreStrokeColor = () => {
    if (score >= 70) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#f97316";
  };

  return (
    <div className="bg-muted/30 rounded-lg border p-4 mb-6">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Price & Property Info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-4 mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Price</span>
              <span className="text-2xl font-bold">${deal.price.toLocaleString()}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">ARV</span>
              <span className="text-2xl font-bold text-success">${deal.arv.toLocaleString()}</span>
            </div>
          </div>

          {/* Last Sold Info */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span className="text-muted-foreground">
              Last Sold ${lastSoldPrice.toLocaleString()} ({lastSoldDate})
            </span>
            {priceDrop > 0 && (
              <span className="text-destructive flex items-center gap-1 font-medium">
                <TrendingDown className="h-3 w-3" />
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

        {/* Right: Badges + Score */}
        <div className="flex items-center gap-4">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background px-3 py-1.5 gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {matchingBuyers} Buyers Match
            </Badge>
            <Badge variant="outline" className="bg-background px-3 py-1.5">
              {locationGrade} Location
            </Badge>
            <Badge
              className={cn(
                "px-3 py-1.5",
                marketHeat === "hot" && "bg-success/10 text-success border-success/30",
                marketHeat === "warm" && "bg-warning/10 text-warning border-warning/30",
                marketHeat === "cold" && "bg-blue-500/10 text-blue-500 border-blue-500/30"
              )}
              variant="outline"
            >
              {marketHeat === "hot" && "Hot Market"}
              {marketHeat === "warm" && "Warm Market"}
              {marketHeat === "cold" && "Cold Market"}
            </Badge>
          </div>

          {/* Circular Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Score</span>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                {/* Background circle */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
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
                <span className={cn("text-lg font-bold", getScoreColor())}>{score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

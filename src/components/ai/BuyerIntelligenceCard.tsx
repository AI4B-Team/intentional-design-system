import React from "react";
import { Users, BadgeCheck, TrendingUp, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface BuyerIntelligence {
  matchingBuyers: number;
  verifiedBuyers: number;
  avgMaxPrice: number | null;
  minMaxPrice: number | null;
  maxMaxPrice: number | null;
  buyersAbove70: number;
  avgArvPercentage: number | null;
  topBuyers: Array<{
    name: string;
    maxPrice: number;
    dealsCompleted: number;
    verified: boolean;
  }>;
}

interface BuyerIntelligenceCardProps {
  data: BuyerIntelligence | null;
  arv?: number;
  offerAmount?: number;
  className?: string;
}

export function BuyerIntelligenceCard({ 
  data, 
  arv,
  offerAmount,
  className 
}: BuyerIntelligenceCardProps) {
  if (!data || data.matchingBuyers === 0) {
    return null;
  }

  // Calculate potential assignment fee
  const potentialSellPrice = arv ? arv * 0.7 : null; // 70% ARV standard exit
  const assignmentFee = potentialSellPrice && offerAmount 
    ? potentialSellPrice - offerAmount 
    : null;

  // Determine if offer is competitive based on buyer data
  const isCompetitive = data.avgArvPercentage && arv && offerAmount
    ? (offerAmount / arv * 100) <= data.avgArvPercentage
    : null;

  return (
    <div className={cn(
      "rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 p-4",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center">
          <Users className="h-4 w-4 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Buyer Intelligence</h4>
          <p className="text-xs text-muted-foreground">Based on {data.matchingBuyers} buyers in this market</p>
        </div>
        {data.verifiedBuyers > 0 && (
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <BadgeCheck className="h-3 w-3 mr-1" />
            {data.verifiedBuyers} Verified
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="bg-background/60 rounded-md p-2.5 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Buyers @ 70%+</div>
          <div className="text-lg font-bold text-foreground">{data.buyersAbove70}</div>
        </div>
        <div className="bg-background/60 rounded-md p-2.5 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Avg % of ARV</div>
          <div className="text-lg font-bold text-primary">{data.avgArvPercentage || "—"}%</div>
        </div>
        <div className="bg-background/60 rounded-md p-2.5 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Avg Max Price</div>
          <div className="text-lg font-bold text-foreground">
            ${data.avgMaxPrice?.toLocaleString() || "—"}
          </div>
        </div>
        <div className="bg-background/60 rounded-md p-2.5 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Price Range</div>
          <div className="text-sm font-semibold text-foreground">
            ${((data.minMaxPrice || 0) / 1000).toFixed(0)}k - ${((data.maxMaxPrice || 0) / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {data.topBuyers.length > 0 && (
        <div className="border-t border-blue-200 dark:border-blue-800 pt-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Top Matching Buyers</div>
          <div className="space-y-1.5">
            {data.topBuyers.map((buyer, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-background/40 rounded px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{buyer.name}</span>
                  {buyer.verified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{buyer.dealsCompleted} deals</span>
                  <span className="font-semibold text-primary">
                    ${buyer.maxPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCompetitive !== null && (
        <div className={cn(
          "mt-3 p-2 rounded-md text-xs font-medium flex items-center gap-2",
          isCompetitive 
            ? "bg-success/10 text-success" 
            : "bg-warning/10 text-warning"
        )}>
          <Target className="h-3.5 w-3.5" />
          {isCompetitive 
            ? `Your offer is below the avg ${data.avgArvPercentage}% buyers pay — room for profit!`
            : `Your offer is above avg buyer pricing (${data.avgArvPercentage}%) — consider lowering for better margins.`
          }
        </div>
      )}
    </div>
  );
}

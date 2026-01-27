import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RentInsightsBadgeProps {
  estimatedRent: number | null;
  propertyValue: number | null;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function RentInsightsBadge({
  estimatedRent,
  propertyValue,
  className,
}: RentInsightsBadgeProps) {
  if (!estimatedRent) return null;

  // Check 1% rule
  const meetsOnePercent = propertyValue ? estimatedRent >= propertyValue / 100 : null;

  // Rough cash flow: Rent - (Value × 0.7% monthly PITI estimate)
  const roughPITI = propertyValue ? propertyValue * 0.007 : 0;
  const potentialCashFlow = estimatedRent - roughPITI;
  const positiveCashFlow = potentialCashFlow > 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" size="sm" className="gap-1">
        <DollarSign className="h-3 w-3" />
        {formatCurrency(estimatedRent)}/mo
      </Badge>
      {propertyValue && (
        <Badge
          variant={positiveCashFlow ? "success" : "warning"}
          size="sm"
          className="gap-1"
        >
          {positiveCashFlow ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {positiveCashFlow ? "Cash Flow+" : "Low CF"}
        </Badge>
      )}
    </div>
  );
}

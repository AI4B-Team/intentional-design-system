import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DealRiskBarProps {
  arvPercent: number; // Current price as percentage of ARV (e.g., 70 means 70%)
  className?: string;
}

export function DealRiskBar({ arvPercent, className }: DealRiskBarProps) {
  // Clamp the value between 50 and 100 for display purposes
  const displayPercent = Math.max(50, Math.min(100, arvPercent));
  
  // Calculate position on the bar (50% to 100% maps to 0% to 100% of bar width)
  const position = ((displayPercent - 50) / 50) * 100;
  
  // Determine badge color based on ARV percent
  const getBadgeColor = () => {
    if (arvPercent <= 70) return "bg-success text-success-foreground";
    if (arvPercent <= 85) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Deal Risk</span>
        <Badge className={cn("text-xs font-semibold rounded-lg", getBadgeColor())}>
          {arvPercent}% ARV
        </Badge>
      </div>

      {/* Gradient Bar with Indicator */}
      <div className="relative">
        {/* Gradient Bar */}
        <div className="h-3 rounded-full bg-gradient-to-r from-success via-warning to-destructive" />
        
        {/* Indicator Circle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-foreground/20 shadow-md transition-all duration-300"
          style={{ left: `calc(${position}% - 10px)` }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>50%</span>
        <span style={{ marginLeft: "30%" }}>70%</span>
        <span style={{ marginLeft: "10%" }}>85%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

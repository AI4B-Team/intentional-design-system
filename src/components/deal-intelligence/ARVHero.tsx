import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DealIntelligenceResult, DealIntelligenceComp } from "./types";

interface ARVHeroProps {
  arvAnalysis: DealIntelligenceResult["arvAnalysis"];
  onViewComp?: (comp: DealIntelligenceComp) => void;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function ARVHero({ arvAnalysis, onViewComp }: ARVHeroProps) {
  const { arvEstimate, confidence, pricePerSqft, comps } = arvAnalysis;
  
  const confidenceColor = confidence >= 80 ? "text-emerald-500" : confidence >= 60 ? "text-amber-500" : "text-red-500";
  const confidenceBg = confidence >= 80 ? "bg-emerald-500" : confidence >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }} />

      <div className="relative">
        {/* ARV Main Display */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-small font-medium text-muted-foreground uppercase tracking-wide">
                After Repair Value
              </span>
            </div>
            <div className="text-5xl font-bold text-foreground tabular-nums tracking-tight">
              {fmt(arvEstimate)}
            </div>
            <div className="flex items-center gap-3 mt-2 text-small text-muted-foreground">
              <span>${pricePerSqft}/sqft</span>
              <span>•</span>
              <span>{comps.length} comps analyzed</span>
            </div>
          </div>

          {/* Confidence ring */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted/30"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={`${confidence}, 100`}
                  className={confidenceColor}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-lg font-bold", confidenceColor)}>{confidence}%</span>
              </div>
            </div>
            <span className="text-tiny text-muted-foreground font-medium">Confidence</span>
          </div>
        </div>

        {/* Comp List - Horizontal Scroll */}
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-small font-semibold text-foreground">Comparable Sales</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {comps.map((comp, idx) => (
            <div
              key={idx}
              onClick={() => onViewComp?.(comp)}
              className={cn(
                "flex-shrink-0 w-[200px] p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                idx === 0 
                  ? "bg-primary/5 border-primary/30 ring-1 ring-primary/10" 
                  : "border-border-subtle hover:bg-surface-secondary/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-tiny font-medium text-foreground truncate max-w-[120px]">
                  {comp.address}
                </span>
                {idx === 0 && <Badge variant="success" size="sm" className="text-[10px] px-1">Best</Badge>}
              </div>
              <div className="text-base font-bold text-foreground tabular-nums">{fmt(comp.salePrice)}</div>
              <div className="flex items-center gap-2 text-tiny text-muted-foreground mt-1">
                <span>{comp.distanceMiles}mi</span>
                <span>•</span>
                <span>{comp.similarity}% match</span>
              </div>
              <div className="flex items-center gap-2 text-tiny text-muted-foreground">
                <span>{comp.beds}bd/{comp.baths}ba</span>
                <span>•</span>
                <span>{comp.sqft?.toLocaleString()} sqft</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

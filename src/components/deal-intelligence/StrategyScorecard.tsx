import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Crown,
  ChevronDown,
  DollarSign,
  Clock,
  AlertTriangle,
  Send,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DealStrategy } from "./types";

interface StrategyScorecardProps {
  strategies: DealStrategy[];
  address: string;
  ownerName?: string;
  onSendOffer: (strategy: DealStrategy) => void;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

const strategyIcons: Record<string, string> = {
  "Novation": "🔄",
  "Subject-To": "🏠",
  "Hybrid": "⚡",
  "Seller Finance": "🤝",
  "Wholesale": "📋",
  "Fix & Flip": "🔨",
};

const riskColors = {
  Low: "text-emerald-600 bg-emerald-50",
  Medium: "text-amber-600 bg-amber-50",
  High: "text-red-600 bg-red-50",
};

export function StrategyScorecard({ strategies, address, ownerName, onSendOffer }: StrategyScorecardProps) {
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  const sorted = [...strategies].sort((a, b) => b.score - a.score);
  const topStrategy = sorted[0];

  const handleCopyPitch = (pitch: string, idx: number) => {
    navigator.clipboard.writeText(pitch);
    setCopiedIdx(idx);
    toast.success("Pitch script copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Exit Strategy Scorecard</h3>
        <Badge variant="success" size="sm" className="gap-1">
          <Crown className="h-3 w-3" />
          {topStrategy?.name} Ranked #1
        </Badge>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-2 text-tiny uppercase tracking-wide text-muted-foreground font-medium">
        <span>Strategy</span>
        <span className="text-right">Score</span>
        <span className="text-right">Profit</span>
        <span className="text-right">Offer Price</span>
        <span className="text-right">Cash Needed</span>
        <span className="text-center">Timeline</span>
        <span></span>
      </div>

      {/* Strategy Rows */}
      {sorted.map((strategy, idx) => {
        const isTop = idx === 0;
        const isExpanded = expandedIdx === idx;

        return (
          <Collapsible
            key={strategy.name}
            open={isExpanded}
            onOpenChange={(open) => setExpandedIdx(open ? idx : null)}
          >
            <Card className={cn(
              "overflow-hidden transition-all",
              isTop && "ring-1 ring-primary/30 border-primary/20",
              isExpanded && "shadow-lg"
            )}>
              {/* Main Row */}
              <CollapsibleTrigger asChild>
                <div className={cn(
                  "grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 items-center px-4 py-3 cursor-pointer hover:bg-surface-secondary/30 transition-colors",
                  isTop && "bg-primary/5"
                )}>
                  {/* Strategy Name */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{strategyIcons[strategy.name] || "📊"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{strategy.name}</span>
                        {isTop && <Crown className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className={cn("text-tiny px-1.5 py-0.5 rounded font-medium", riskColors[strategy.riskLevel])}>
                        {strategy.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <span className="font-bold text-foreground tabular-nums">{strategy.score}</span>
                    <Progress value={strategy.score} className="h-1 w-16" />
                  </div>

                  {/* Profit */}
                  <div className="hidden md:block text-right">
                    <span className={cn(
                      "font-bold tabular-nums",
                      strategy.projectedProfit > 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {fmt(strategy.projectedProfit)}
                    </span>
                  </div>

                  {/* Offer Price */}
                  <div className="hidden md:block text-right">
                    <span className="font-medium text-foreground tabular-nums">{fmt(strategy.offerPrice)}</span>
                  </div>

                  {/* Cash Needed */}
                  <div className="hidden md:block text-right">
                    <span className="text-muted-foreground tabular-nums">{fmt(strategy.cashNeeded)}</span>
                  </div>

                  {/* Timeline */}
                  <div className="hidden md:flex items-center justify-center gap-1 text-small text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {strategy.closeTimeline}
                  </div>

                  {/* Expand */}
                  <div className="flex items-center justify-end">
                    {/* Mobile summary */}
                    <div className="md:hidden text-right mr-3">
                      <span className={cn("font-bold tabular-nums text-small", strategy.projectedProfit > 0 ? "text-emerald-600" : "text-red-600")}>
                        {fmt(strategy.projectedProfit)}
                      </span>
                      <div className="text-tiny text-muted-foreground">{strategy.score}/100</div>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Expanded Content */}
              <CollapsibleContent>
                <div className="border-t border-border-subtle px-4 py-5 space-y-5 bg-surface-secondary/20">
                  {/* Deal Numbers Grid */}
                  <div>
                    <h4 className="text-small font-semibold text-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Deal Numbers
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Purchase Price", value: strategy.dealNumbers.purchasePrice },
                        { label: "Repair Costs", value: strategy.dealNumbers.repairCosts },
                        { label: "Holding Costs", value: strategy.dealNumbers.holdingCosts },
                        { label: "Selling Costs", value: strategy.dealNumbers.sellingCosts },
                        { label: "Total Investment", value: strategy.dealNumbers.totalInvestment },
                        { label: "Exit Price", value: strategy.dealNumbers.exitPrice },
                        { label: "Net Profit", value: strategy.dealNumbers.netProfit, highlight: true },
                        ...(strategy.monthlyPayment ? [{ label: "Monthly Payment", value: strategy.monthlyPayment }] : []),
                      ].map((item, i) => (
                        <div key={i} className={cn(
                          "p-2 rounded-md",
                          (item as any).highlight ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-background"
                        )}>
                          <div className="text-tiny text-muted-foreground">{item.label}</div>
                          <div className={cn(
                            "font-semibold tabular-nums",
                            (item as any).highlight ? "text-emerald-600" : "text-foreground"
                          )}>
                            {fmt(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why It Works */}
                  <div>
                    <h4 className="text-small font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Why This Works
                    </h4>
                    <p className="text-small text-muted-foreground leading-relaxed">
                      {strategy.whyItWorks}
                    </p>
                  </div>

                  {/* Seller Pitch Script */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-small font-semibold text-foreground flex items-center gap-2">
                        💬 Seller Pitch Script
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPitch(strategy.sellerPitch, idx)}
                        className="gap-1 text-tiny"
                      >
                        {copiedIdx === idx ? (
                          <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Copied</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copy</>
                        )}
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border-subtle text-small text-foreground leading-relaxed italic">
                      "{strategy.sellerPitch}"
                    </div>
                  </div>

                  {/* Send Offer CTA */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => onSendOffer(strategy)}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Offer via Offer Blaster
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCopyPitch(strategy.sellerPitch, idx)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Script
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}

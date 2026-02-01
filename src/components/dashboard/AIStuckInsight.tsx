import * as React from "react";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

interface AIStuckInsightProps {
  stageStatus: string;
  count: number;
  showGap: boolean;
}

// AI-generated insights for why stages get stuck
// One-line explanations that build trust without overwhelming
const STAGE_INSIGHTS: Record<string, string> = {
  // Discovery stages
  new: "Deals typically stall here when lead sources dry up or follow-up cadence breaks.",
  contacted: "Most leads go cold without a second touch within 48 hours.",
  appointment: "Appointment gaps usually mean qualification is happening too late in calls.",
  
  // Intent stages
  offer_made: "Offers stall when pricing is too aggressive or terms aren't flexible enough.",
  follow_up: "Sellers need 3-5 touches on average before making a decision.",
  negotiating: "Extended negotiations often indicate misaligned expectations on value.",
  
  // Commitment stages
  under_contract: "Contract delays usually stem from title issues or inspection findings.",
  marketing: "Deals stuck here may need better buyer outreach or pricing adjustment.",
  
  // Outcome stages
  closed: "Great work! Focus on repeating what worked in these deals.",
  sold: "Analyze these wins to optimize your acquisition strategy.",
};

export function AIStuckInsight({ stageStatus, count, showGap }: AIStuckInsightProps) {
  // Only show insight for GAP stages or empty stages
  const shouldShowInsight = showGap || count === 0;
  
  if (!shouldShowInsight) return null;
  
  const insight = STAGE_INSIGHTS[stageStatus];
  if (!insight) return null;
  
  return (
    <div className={cn(
      "flex items-start gap-2 mt-1 pl-10", // Indent to align with stage content
      "animate-fade-in"
    )}>
      <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-tiny text-muted-foreground/80 italic leading-relaxed">
        {insight}
      </p>
    </div>
  );
}

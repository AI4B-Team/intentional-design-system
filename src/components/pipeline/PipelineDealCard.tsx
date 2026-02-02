import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Bath, Bed, Ruler, Timer } from "lucide-react";

interface PipelineDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  stage: string;
  asking_price: number;
  offer_amount: number | null;
  arv: number;
  equity_percentage: number;
  lead_score: number;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_type: string;
  source: string;
  days_in_stage: number;
  created_at: string;
  last_activity: string;
  notes: string | null;
  property_type: string;
  beds: number;
  baths: number;
  sqft: number;
}

interface StageConfig {
  id: string;
  label: string;
  color: string;
  description: string;
  targetDays: number;
  category: string;
}

interface PipelineDealCardProps {
  deal: PipelineDeal;
  stageConfig: StageConfig;
  nextStage?: StageConfig;
  prevStage?: StageConfig;
  onView: () => void;
  onMove: (newStage: string) => void;
}

// Get urgency level based on days in stage
function getUrgencyLevel(daysInStage: number, targetDays: number) {
  if (targetDays === 0) return "none";
  const ratio = daysInStage / targetDays;
  if (ratio >= 1.5) return "critical";
  if (ratio >= 1) return "overdue";
  if (ratio >= 0.7) return "warning";
  return "normal";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PipelineDealCard({
  deal,
  stageConfig,
  onView,
}: PipelineDealCardProps) {
  const urgency = getUrgencyLevel(deal.days_in_stage, stageConfig.targetDays);
  const isOverdue = urgency === "overdue" || urgency === "critical";

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg group cursor-pointer",
        "border-l-4",
        urgency === "critical" && "border-l-destructive bg-destructive/5",
        urgency === "overdue" && "border-l-warning bg-warning/5",
        urgency === "warning" && "border-l-amber-400",
        urgency === "normal" && "border-l-border-subtle",
        urgency === "none" && "border-l-success"
      )}
      onClick={onView}
    >
      <div className="p-3">
        {/* Top row: Price + Days */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold text-success leading-none">
              {formatCurrency(deal.asking_price)}
            </div>
          </div>

          <div
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1",
              isOverdue && "border-warning/40"
            )}
            title={
              stageConfig.targetDays > 0
                ? `${deal.days_in_stage} day(s) in ${stageConfig.label} (target: ${stageConfig.targetDays})`
                : `${deal.days_in_stage} day(s) in ${stageConfig.label}`
            }
          >
            <Timer
              className={cn(
                "h-3.5 w-3.5",
                isOverdue ? "text-warning" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap tabular-nums",
                isOverdue ? "text-warning" : "text-muted-foreground"
              )}
            >
              {deal.days_in_stage === 0 ? "Today" : `${deal.days_in_stage}d`}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="mt-2 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug break-words">
            {deal.address}
          </p>
          <p className="text-xs text-muted-foreground leading-snug break-words">
            {deal.city}, {deal.state} {deal.zip}
          </p>
        </div>

        {/* Specs */}
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Bed className="h-3.5 w-3.5 shrink-0" />
            <span>{deal.beds} Beds</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Bath className="h-3.5 w-3.5 shrink-0" />
            <span>{deal.baths} Baths</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Ruler className="h-3.5 w-3.5 shrink-0" />
            <span>{deal.sqft.toLocaleString()} SF</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

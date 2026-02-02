import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  Phone,
  Target,
} from "lucide-react";
import { differenceInDays } from "date-fns";
import type { PipelineDeal, PipelineStageConfig } from "./types";

interface StageConfig {
  id: string;
  label: string;
  targetDays: number;
}

interface FocusItem {
  id: string;
  type: "follow_up" | "stuck" | "closing_soon" | "no_contact";
  icon: React.ElementType;
  label: string;
  count: number;
  deals: PipelineDeal[];
  color: string;
  filterStage?: string;
}

interface FocusStripProps {
  deals: PipelineDeal[];
  stages: StageConfig[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function FocusStrip({
  deals,
  stages,
  activeFilter,
  onFilterChange,
}: FocusStripProps) {
  const focusItems = React.useMemo(() => {
    const items: FocusItem[] = [];

    // Offers needing follow-up (5+ days in offer_made stage)
    const offersNeedFollowUp = deals.filter(
      (d) => d.stage === "offer_made" && d.days_in_stage >= 5
    );
    if (offersNeedFollowUp.length > 0) {
      items.push({
        id: "follow_up",
        type: "follow_up",
        icon: Bell,
        label: `${offersNeedFollowUp.length} Offer${offersNeedFollowUp.length > 1 ? "s" : ""} Need Follow-Up`,
        count: offersNeedFollowUp.length,
        deals: offersNeedFollowUp,
        color: "bg-warning/10 text-warning border-warning/30",
        filterStage: "offer_made",
      });
    }

    // Stuck in negotiating (8+ days)
    const stuckNegotiating = deals.filter(
      (d) => d.stage === "negotiating" && d.days_in_stage >= 8
    );
    if (stuckNegotiating.length > 0) {
      items.push({
        id: "stuck_negotiating",
        type: "stuck",
        icon: AlertTriangle,
        label: `${stuckNegotiating.length} Deal${stuckNegotiating.length > 1 ? "s" : ""} Stuck In Negotiating (8+ Days)`,
        count: stuckNegotiating.length,
        deals: stuckNegotiating,
        color: "bg-destructive/10 text-destructive border-destructive/30",
        filterStage: "negotiating",
      });
    }

    // Contracts closing soon (under_contract for 15+ days, assuming 30-day close)
    const closingSoon = deals.filter(
      (d) => d.stage === "under_contract" && d.days_in_stage >= 15
    );
    if (closingSoon.length > 0) {
      const daysLeft = 30 - closingSoon[0]?.days_in_stage || 14;
      items.push({
        id: "closing_soon",
        type: "closing_soon",
        icon: Calendar,
        label: `${closingSoon.length} Contract${closingSoon.length > 1 ? "s" : ""} Closing In ~${Math.max(daysLeft, 1)} Days`,
        count: closingSoon.length,
        deals: closingSoon,
        color: "bg-info/10 text-info border-info/30",
        filterStage: "under_contract",
      });
    }

    // No contact in 5+ days (any active stage)
    const noContact = deals.filter((d) => {
      if (["closed", "sold"].includes(d.stage)) return false;
      const daysSince = differenceInDays(new Date(), new Date(d.last_activity));
      return daysSince >= 5;
    });
    if (noContact.length > 0) {
      items.push({
        id: "no_contact",
        type: "no_contact",
        icon: Phone,
        label: `${noContact.length} Deal${noContact.length > 1 ? "s" : ""} With No Contact In 5+ Days`,
        count: noContact.length,
        deals: noContact,
        color: "bg-muted text-muted-foreground border-border",
      });
    }

    return items;
  }, [deals]);

  if (focusItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-surface-secondary to-background border border-border-subtle rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-brand" />
        <span className="text-small font-semibold text-foreground">
          Today's Focus
        </span>
        {activeFilter && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-tiny text-muted-foreground hover:text-foreground ml-2 underline"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {focusItems.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              onFilterChange(activeFilter === item.id ? null : item.id)
            }
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-tiny font-medium transition-all",
              item.color,
              activeFilter === item.id
                ? "ring-2 ring-brand ring-offset-1"
                : "hover:opacity-80"
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getFocusFilteredDeals(
  deals: PipelineDeal[],
  focusFilter: string | null
): PipelineDeal[] {
  if (!focusFilter) return deals;

  switch (focusFilter) {
    case "follow_up":
      return deals.filter((d) => d.stage === "offer_made" && d.days_in_stage >= 5);
    case "stuck_negotiating":
      return deals.filter((d) => d.stage === "negotiating" && d.days_in_stage >= 8);
    case "closing_soon":
      return deals.filter((d) => d.stage === "under_contract" && d.days_in_stage >= 15);
    case "no_contact":
      return deals.filter((d) => {
        if (["closed", "sold"].includes(d.stage)) return false;
        const daysSince = differenceInDays(new Date(), new Date(d.last_activity));
        return daysSince >= 5;
      });
    default:
      return deals;
  }
}

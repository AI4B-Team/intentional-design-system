import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, Calendar, Phone, FileText } from "lucide-react";
import type { PipelineDeal } from "./types";

interface StagePressureIndicatorProps {
  stageId: string;
  deals: PipelineDeal[];
}

interface PressureInfo {
  text: string;
  icon: React.ElementType;
  color: string;
}

export function getStagePressure(
  stageId: string,
  deals: PipelineDeal[]
): PressureInfo | null {
  const stageDeals = deals.filter((d) => d.stage === stageId);

  switch (stageId) {
    case "lead": {
      const needsContact = stageDeals.filter((d) => d.days_in_stage >= 1).length;
      if (needsContact > 0) {
        return {
          text: `${needsContact} need${needsContact === 1 ? "s" : ""} first contact`,
          icon: Phone,
          color: "text-brand",
        };
      }
      break;
    }
    case "contacted": {
      const needsFollowUp = stageDeals.filter((d) => d.days_in_stage >= 3).length;
      if (needsFollowUp > 0) {
        return {
          text: `${needsFollowUp} follow-up${needsFollowUp === 1 ? "" : "s"} due`,
          icon: Phone,
          color: "text-info",
        };
      }
      break;
    }
    case "analyzing": {
      const needsCompletion = stageDeals.filter((d) => d.days_in_stage >= 2).length;
      if (needsCompletion > 0) {
        return {
          text: `${needsCompletion} need${needsCompletion === 1 ? "s" : ""} analysis`,
          icon: FileText,
          color: "text-info",
        };
      }
      break;
    }
    case "offer_made": {
      const awaiting = stageDeals.filter((d) => d.days_in_stage >= 3).length;
      if (awaiting > 0) {
        return {
          text: `${awaiting} awaiting response`,
          icon: Clock,
          color: "text-warning",
        };
      }
      break;
    }
    case "negotiating": {
      const overdue = stageDeals.filter((d) => d.days_in_stage >= 7).length;
      if (overdue > 0) {
        return {
          text: `${overdue} counter${overdue === 1 ? "" : "s"} overdue`,
          icon: AlertCircle,
          color: "text-destructive",
        };
      }
      break;
    }
    case "under_contract": {
      const closingSoon = stageDeals.filter((d) => d.days_in_stage >= 15).length;
      if (closingSoon > 0) {
        return {
          text: `${closingSoon} closing soon`,
          icon: Calendar,
          color: "text-success",
        };
      }
      break;
    }
    default:
      return null;
  }

  return null;
}

export function StagePressureIndicator({
  stageId,
  deals,
}: StagePressureIndicatorProps) {
  const pressure = getStagePressure(stageId, deals);

  if (!pressure) return null;

  const Icon = pressure.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-tiny font-medium mt-1",
        pressure.color
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{pressure.text}</span>
    </div>
  );
}

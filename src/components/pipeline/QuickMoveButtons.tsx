import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Phone,
  FileText,
  DollarSign,
  Handshake,
  CheckCircle2,
} from "lucide-react";

interface QuickMoveButtonsProps {
  currentStage: string;
  onMove: (newStage: string) => void;
}

interface QuickAction {
  targetStage: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  lead: [
    {
      targetStage: "contacted",
      label: "Contacted",
      icon: Phone,
      color: "bg-red-400 hover:bg-red-500",
    },
  ],
  contacted: [
    {
      targetStage: "analyzing",
      label: "Analyzing",
      icon: FileText,
      color: "bg-red-300 hover:bg-red-400",
    },
  ],
  analyzing: [
    {
      targetStage: "offer_made",
      label: "Offer Made",
      icon: DollarSign,
      color: "bg-amber-500 hover:bg-amber-600",
    },
  ],
  offer_made: [
    {
      targetStage: "negotiating",
      label: "Negotiating",
      icon: Handshake,
      color: "bg-amber-400 hover:bg-amber-500",
    },
    {
      targetStage: "under_contract",
      label: "Under Contract",
      icon: CheckCircle2,
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ],
  negotiating: [
    {
      targetStage: "follow_up",
      label: "Follow Up",
      icon: Phone,
      color: "bg-amber-400 hover:bg-amber-500",
    },
    {
      targetStage: "under_contract",
      label: "Under Contract",
      icon: CheckCircle2,
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ],
  follow_up: [
    {
      targetStage: "under_contract",
      label: "Under Contract",
      icon: CheckCircle2,
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ],
  under_contract: [
    {
      targetStage: "closed",
      label: "Closed",
      icon: CheckCircle2,
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
  ],
};

export function QuickMoveButtons({
  currentStage,
  onMove,
}: QuickMoveButtonsProps) {
  const actions = QUICK_ACTIONS[currentStage];

  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.targetStage}
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-tiny font-medium text-white",
              action.color
            )}
            onClick={(e) => {
              e.stopPropagation();
              onMove(action.targetStage);
            }}
          >
            <Icon className="h-3 w-3 mr-1" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Calendar, 
  FileText, 
  Send, 
  MessageSquare,
  Megaphone,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface StageActionCTAProps {
  stageStatus: string;
  stageLabel: string;
  count: number;
  percentage: number;
  showGap: boolean;
}

// Context-aware action configuration per stage
const STAGE_ACTIONS: Record<string, {
  label: string;
  icon: React.ElementType;
  route: string;
  actionType: "call" | "schedule" | "offer" | "followup" | "marketing";
}> = {
  // Discovery stages
  new: {
    label: "Call First Lead",
    icon: Phone,
    route: "/properties?status=new&sort=motivation_score",
    actionType: "call",
  },
  contacted: {
    label: "Call First Lead",
    icon: Phone,
    route: "/properties?status=contacted&sort=motivation_score",
    actionType: "call",
  },
  appointment: {
    label: "Schedule Appointment",
    icon: Calendar,
    route: "/properties?status=contacted&sort=motivation_score",
    actionType: "schedule",
  },
  // Intent stages
  offer_made: {
    label: "Generate Offer",
    icon: FileText,
    route: "/properties?status=appointment&sort=motivation_score",
    actionType: "offer",
  },
  follow_up: {
    label: "Send Follow-Up",
    icon: Send,
    route: "/properties?status=offer_made&sort=updated_at",
    actionType: "followup",
  },
  negotiating: {
    label: "Send Counter",
    icon: MessageSquare,
    route: "/properties?status=negotiating&sort=updated_at",
    actionType: "followup",
  },
  // Commitment stages
  under_contract: {
    label: "Review Contract",
    icon: FileText,
    route: "/properties?status=under_contract",
    actionType: "followup",
  },
  marketing: {
    label: "Create Listing",
    icon: Megaphone,
    route: "/properties?status=under_contract&sort=created_at",
    actionType: "marketing",
  },
  // Outcome stages (typically don't need CTAs)
  closed: {
    label: "View Closed",
    icon: ArrowRight,
    route: "/properties?status=closed",
    actionType: "followup",
  },
  sold: {
    label: "View Sold",
    icon: ArrowRight,
    route: "/properties?status=sold",
    actionType: "followup",
  },
};

export function StageActionCTA({ stageStatus, stageLabel, count, percentage, showGap }: StageActionCTAProps) {
  const navigate = useNavigate();
  
  // Only show CTA if:
  // 1. Stage has 0 count (empty), OR
  // 2. Stage has a GAP flag, OR  
  // 3. Stage has low percentage (< 40%)
  const shouldShowCTA = count === 0 || showGap || percentage < 40;
  
  if (!shouldShowCTA) return null;
  
  const action = STAGE_ACTIONS[stageStatus];
  if (!action) return null;
  
  const Icon = action.icon;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-5 px-1.5 gap-1 text-tiny font-medium transition-all",
        "opacity-0 group-hover:opacity-100",
        "hover:bg-primary/10 hover:text-primary",
        // Show by default on mobile
        "sm:opacity-0 sm:group-hover:opacity-100"
      )}
      onClick={(e) => {
        e.stopPropagation();
        navigate(action.route);
      }}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{action.label}</span>
      <Sparkles className="h-2.5 w-2.5 text-amber-500" />
    </Button>
  );
}

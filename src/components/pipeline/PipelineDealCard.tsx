import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { 
  Bath, 
  Bed, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Ruler, 
  Timer,
  Phone,
  CalendarCheck,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Stage-specific primary actions with category colors
const STAGE_PRIMARY_ACTIONS: Record<string, { label: string; icon: React.ElementType; tooltip: string; colorClass: string }> = {
  new: { label: "Call", icon: Phone, tooltip: "Call Lead", colorClass: "border-red-500 text-red-600 hover:bg-red-50" },
  contacted: { label: "Follow Up", icon: CalendarCheck, tooltip: "Schedule Follow Up", colorClass: "border-red-500 text-red-600 hover:bg-red-50" },
  appointment: { label: "Log Outcome", icon: ClipboardCheck, tooltip: "Log Appointment Outcome", colorClass: "border-red-500 text-red-600 hover:bg-red-50" },
  offer_made: { label: "Follow Up", icon: MessageSquare, tooltip: "Follow Up On Offer", colorClass: "border-amber-500 text-amber-600 hover:bg-amber-50" },
  negotiating: { label: "Respond", icon: MessageSquare, tooltip: "Respond To Counter", colorClass: "border-amber-500 text-amber-600 hover:bg-amber-50" },
  follow_up: { label: "Follow Up", icon: CalendarCheck, tooltip: "Schedule Follow Up", colorClass: "border-amber-500 text-amber-600 hover:bg-amber-50" },
  under_contract: { label: "Timeline", icon: Calendar, tooltip: "View Contract Timeline", colorClass: "border-blue-500 text-blue-600 hover:bg-blue-50" },
  marketing: { label: "Manage", icon: FileText, tooltip: "Manage Marketing", colorClass: "border-blue-500 text-blue-600 hover:bg-blue-50" },
  closed: { label: "Details", icon: FileText, tooltip: "View Deal Details", colorClass: "border-emerald-500 text-emerald-600 hover:bg-emerald-50" },
  sold: { label: "Details", icon: FileText, tooltip: "View Deal Details", colorClass: "border-emerald-500 text-emerald-600 hover:bg-emerald-50" },
};

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

// Get time-based urgency styling
function getTimeUrgencyStyle(daysInStage: number) {
  if (daysInStage >= 7) {
    return {
      badge: "bg-destructive text-destructive-foreground border-destructive",
      icon: "text-destructive-foreground",
      text: "text-destructive-foreground",
      pulse: true,
    };
  }
  if (daysInStage >= 3) {
    return {
      badge: "bg-warning text-warning-foreground border-warning",
      icon: "text-warning-foreground",
      text: "text-warning-foreground",
      pulse: false,
    };
  }
  return {
    badge: "bg-background border-border",
    icon: "text-muted-foreground",
    text: "text-muted-foreground",
    pulse: false,
  };
}

export function PipelineDealCard({
  deal,
  stageConfig,
  nextStage,
  prevStage,
  onView,
  onMove,
}: PipelineDealCardProps) {
  const urgency = getUrgencyLevel(deal.days_in_stage, stageConfig.targetDays);
  const isOverdue = urgency === "overdue" || urgency === "critical";
  const timeStyle = getTimeUrgencyStyle(deal.days_in_stage);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "transition-all duration-200 hover:shadow-md group cursor-pointer relative bg-card rounded-lg",
          "border-l-4",
          urgency === "critical" && "border-l-destructive bg-destructive/5",
          urgency === "overdue" && "border-l-warning bg-warning/5",
          urgency === "warning" && "border-l-amber-400",
          urgency === "normal" && "border-l-border-subtle",
          urgency === "none" && "border-l-success"
        )}
        onClick={onView}
      >
        {/* Glowing left border for overdue */}
        {deal.days_in_stage >= 7 && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive shadow-[0_0_8px_2px_rgba(239,68,68,0.4)] rounded-l-lg" />
        )}
        
        <div className="px-2 py-1.5 flex flex-col gap-1">
          {/* Top row: Timer badge + Menu */}
          <div className="flex items-center justify-between -mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border",
                    timeStyle.badge,
                    timeStyle.pulse && "animate-pulse"
                  )}
                >
                  <Timer className={cn("h-3 w-3", timeStyle.icon)} />
                  <span className={cn("text-xs font-medium tabular-nums", timeStyle.text)}>
                    {deal.days_in_stage === 0 ? "Today" : `${deal.days_in_stage}D`}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {deal.days_in_stage} Day{deal.days_in_stage !== 1 ? "s" : ""} In {stageConfig.label}
                  {stageConfig.targetDays > 0 ? ` (Target: ${stageConfig.targetDays})` : ""}
                </p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-0.5"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={handleMenuClick}>
                <DropdownMenuItem onClick={() => onView()}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {prevStage && (
                  <DropdownMenuItem onClick={() => onMove(prevStage.id)}>
                    Move to {prevStage.label}
                  </DropdownMenuItem>
                )}
                {nextStage && (
                  <DropdownMenuItem onClick={() => onMove(nextStage.id)}>
                    Move to {nextStage.label}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Address */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug break-words">
              {deal.address}
            </p>
            <p className="text-xs text-muted-foreground leading-snug break-words">
              {deal.city}, {deal.state} {deal.zip}
            </p>
          </div>

          {/* Specs (middle) - single row with tooltips */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 shrink-0">
                  <Bed className="h-3.5 w-3.5 shrink-0" />
                  <span>{deal.beds}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{deal.beds} Bedrooms</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 shrink-0">
                  <Bath className="h-3.5 w-3.5 shrink-0" />
                  <span>{deal.baths}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{deal.baths} Bathrooms</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 shrink-0">
                  <Ruler className="h-3.5 w-3.5 shrink-0" />
                  <span>{deal.sqft.toLocaleString()}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{deal.sqft.toLocaleString()} Square Feet</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Price + ARV (bottom row) */}
          <div className="flex items-center gap-3">
            <div className="text-base font-bold text-success">
              {formatCurrency(deal.asking_price)}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-muted-foreground">
                  ARV: {formatCurrency(deal.arv)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>After Repair Value</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Quick Move Arrows + Primary Action Button */}
          <div className="flex items-center justify-center gap-1 pt-1">
            {prevStage ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(prevStage.id);
                    }}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Move To {prevStage.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="w-5" />
            )}

            {(() => {
              const action = STAGE_PRIMARY_ACTIONS[deal.stage] || STAGE_PRIMARY_ACTIONS.new;
              const Icon = action.icon;
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-5 px-2 text-[11px]", action.colorClass)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onView();
                      }}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })()}

            {nextStage ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(nextStage.id);
                    }}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Move To {nextStage.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="w-5" />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

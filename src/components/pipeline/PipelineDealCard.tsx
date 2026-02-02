import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  MoreVertical,
  Phone,
  Eye,
  ArrowRight,
  Trash2,
  Timer,
  Target,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react";

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

// Get next action for the deal
function getNextAction(deal: PipelineDeal, targetDays: number) {
  const isOverdue = deal.days_in_stage > targetDays && targetDays > 0;
  
  if (deal.stage === "new") {
    return { text: "Call Lead", icon: Phone, primary: true };
  }
  if (deal.stage === "contacted") {
    return { text: "Schedule Appt", icon: Clock, primary: true };
  }
  if (deal.stage === "appointment") {
    return { text: "Run Analysis", icon: FileText, primary: true };
  }
  if (deal.stage === "offer_made") {
    return { text: "Follow Up", icon: Phone, primary: isOverdue };
  }
  if (deal.stage === "negotiating") {
    return { text: "Send Counter", icon: DollarSign, primary: true };
  }
  if (deal.stage === "under_contract") {
    return { text: "Track Closing", icon: Target, primary: false };
  }
  if (deal.stage === "marketing") {
    return { text: "Blast Buyers", icon: MessageSquare, primary: true };
  }
  return { text: "View Deal", icon: Eye, primary: false };
}

// Profit band calculation
function getProfitBand(equityPct: number, arv: number, askingPrice: number) {
  const spread = arv - askingPrice;
  const spreadK = Math.round(spread / 1000);
  
  if (equityPct >= 25) {
    return { label: "Strong", variant: "success" as const, spread: spreadK };
  }
  if (equityPct >= 15) {
    return { label: "Thin", variant: "warning" as const, spread: spreadK };
  }
  return { label: "Risky", variant: "destructive" as const, spread: spreadK };
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
  const nextAction = getNextAction(deal, stageConfig.targetDays);
  const profitBand = getProfitBand(deal.equity_percentage, deal.arv, deal.asking_price);
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
      {/* Header: Address + Menu */}
      <div className="px-3 pt-1.5 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-small font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {deal.address}
            </h4>
            <div className="flex items-center gap-1 text-tiny text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{deal.city}, {deal.state}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="h-4 w-4 mr-2" />
                Call {deal.contact_name?.split(" ")[0] || "Contact"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {nextStage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(nextStage.id); }}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move to {nextStage.label}
                </DropdownMenuItem>
              )}
              {prevStage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(prevStage.id); }}>
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Move to {prevStage.label}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Property Specs */}
        <div className="flex items-center gap-3 mt-2 text-tiny text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {deal.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {deal.baths}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3 w-3" />
            {deal.sqft.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Financial Row */}
      <div className="px-3 py-2 bg-surface-secondary/50 border-y border-border-subtle">
        <div className="flex items-center justify-between gap-2">
          {/* Price Info */}
          <div className="flex items-center gap-2 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-body font-bold text-foreground cursor-help shrink-0">
                    ${(deal.asking_price / 1000).toFixed(0)}k
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-tiny font-medium">Asking Price</p>
                  <p className="text-tiny text-muted-foreground">${deal.asking_price.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {deal.offer_amount && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="success" size="sm" className="font-medium cursor-help shrink-0">
                      OFFER ${(deal.offer_amount / 1000).toFixed(0)}K
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-tiny font-medium">Your Offer</p>
                    <p className="text-tiny text-muted-foreground">${deal.offer_amount.toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Spread Badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant={profitBand.variant}
                  size="sm"
                  className="cursor-help shrink-0"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +${profitBand.spread}K
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-tiny">
                  <p className="font-medium">{profitBand.label} Deal</p>
                  <p className="text-muted-foreground">
                    {deal.equity_percentage}% equity • ARV ${(deal.arv / 1000).toFixed(0)}k
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Status Row */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Lead Score */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-tiny font-medium cursor-help shrink-0",
                  deal.lead_score >= 80 && "bg-success/10 text-success",
                  deal.lead_score >= 60 && deal.lead_score < 80 && "bg-warning/10 text-warning",
                  deal.lead_score < 60 && "bg-destructive/10 text-destructive"
                )}>
                  <Target className="h-3 w-3" />
                  <span>{deal.lead_score}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-tiny font-medium">Lead Score</p>
                <p className="text-tiny text-muted-foreground">
                  {deal.lead_score >= 80 ? "Hot lead" : deal.lead_score >= 60 ? "Warm lead" : "Cold lead"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Days in Stage */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1.5 text-tiny font-medium cursor-help shrink-0",
                  isOverdue ? "text-warning" : "text-muted-foreground"
                )}>
                  {isOverdue && <AlertTriangle className="h-3 w-3" />}
                  <Timer className="h-3 w-3" />
                  <span className="whitespace-nowrap">
                    {deal.days_in_stage === 0 ? "Today" : `${deal.days_in_stage} days`}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-tiny font-medium">Days in {stageConfig.label}</p>
                {stageConfig.targetDays > 0 && (
                  <p className="text-tiny text-muted-foreground">
                    Target: {stageConfig.targetDays} days
                    {isOverdue && " (overdue)"}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-2 pt-0">
        <div className="flex items-center justify-center gap-2">
          {/* Quick Move Back - or placeholder for centering */}
          {prevStage ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(prevStage.id);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-tiny">Move to {prevStage.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="h-8 w-8 shrink-0" />
          )}

          {/* Primary CTA */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={nextAction.primary ? "default" : "outline"}
                  className={cn(
                    "flex-1 h-8 text-tiny font-medium",
                    nextAction.primary && "bg-primary hover:bg-primary/90"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Action handler
                  }}
                >
                  <nextAction.icon className="h-3.5 w-3.5 mr-1.5" />
                  {nextAction.text}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-tiny">Recommended next action for this deal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Quick Move Forward - or placeholder for centering */}
          {nextStage ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(nextStage.id);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-tiny">Move to {nextStage.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="h-8 w-8 shrink-0" />
          )}
        </div>
      </div>
    </Card>
  );
}

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Target,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  ArrowRight,
  Flame,
  DollarSign,
  Clock,
  Zap,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface FocusDeal {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  status: string;
  motivation_score: number | null;
  profit_potential: number;
  urgency_level: "critical" | "high" | "medium";
  urgency_reason: string;
  days_in_stage: number;
  owner_phone: string | null;
  owner_email: string | null;
}

interface TodaysFocusProps {
  deals: FocusDeal[];
  isLoading?: boolean;
}

// Status to label mapping
const STATUS_LABELS: Record<string, string> = {
  new: "New Lead",
  contacted: "Contacted",
  appointment: "Appointment",
  offer_made: "Offer Made",
  follow_up: "Follow Up",
  negotiating: "Negotiating",
  under_contract: "Under Contract",
  marketing: "Marketing",
  closed: "Closed",
  sold: "Sold",
};

// Helper to format currency
function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString()}`;
}

// One-click action button
interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "primary" | "success";
}

function QuickAction({ icon: Icon, label, onClick, variant = "default" }: QuickActionProps) {
  const variantStyles = {
    default: "hover:bg-muted hover:text-foreground",
    primary: "hover:bg-primary/10 hover:text-primary",
    success: "hover:bg-success/10 hover:text-success",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              variantStyles[variant]
            )}
            onClick={onClick}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Single focus deal item
interface FocusDealItemProps {
  deal: FocusDeal;
  rank: number;
  onView: () => void;
  onCall: () => void;
  onText: () => void;
  onOffer: () => void;
  onSchedule: () => void;
}

function FocusDealItem({ deal, rank, onView, onCall, onText, onOffer, onSchedule }: FocusDealItemProps) {
  const urgencyColors = {
    critical: { bg: "bg-destructive/10", text: "text-destructive", icon: Flame },
    high: { bg: "bg-warning/10", text: "text-warning", icon: Zap },
    medium: { bg: "bg-info/10", text: "text-info", icon: Clock },
  };

  const urgency = urgencyColors[deal.urgency_level];
  const UrgencyIcon = urgency.icon;

  // Rank badge styling
  const rankStyles = {
    1: "bg-amber-500 text-white",
    2: "bg-slate-400 text-white",
    3: "bg-amber-700 text-white",
  };

  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-lg hover:bg-background-secondary transition-all cursor-pointer">
      {/* Rank badge */}
      <div className={cn(
        "flex items-center justify-center h-6 w-6 rounded-full text-tiny font-bold shrink-0",
        rankStyles[rank as keyof typeof rankStyles] || "bg-muted text-muted-foreground"
      )}>
        {rank}
      </div>

      {/* Deal info */}
      <div className="flex-1 min-w-0" onClick={onView}>
        <div className="flex items-center gap-2">
          <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {deal.address}
          </p>
          {deal.motivation_score && deal.motivation_score > 800 && (
            <Flame className="h-3.5 w-3.5 text-destructive animate-pulse shrink-0" />
          )}
        </div>
        <p className="text-tiny text-muted-foreground truncate">
          {[deal.city, deal.state].filter(Boolean).join(", ")}
        </p>
        
        {/* Urgency reason + status */}
        <div className="flex items-center gap-2 mt-1.5">
          <Badge 
            variant="outline" 
            className={cn("text-tiny px-1.5 py-0 h-5 gap-1", urgency.bg, urgency.text, "border-0")}
          >
            <UrgencyIcon className="h-3 w-3" />
            {deal.urgency_reason}
          </Badge>
          <span className="text-tiny text-muted-foreground">
            {STATUS_LABELS[deal.status] || deal.status}
          </span>
        </div>
      </div>

      {/* Profit potential */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-success">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="text-small font-bold tabular-nums">
            {formatCurrency(deal.profit_potential)}
          </span>
        </div>
        <p className="text-tiny text-muted-foreground">potential</p>
      </div>

      {/* Quick actions - visible on hover */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm border border-border-subtle">
        <QuickAction icon={Phone} label="Call" onClick={onCall} variant="primary" />
        <QuickAction icon={MessageSquare} label="Text" onClick={onText} />
        <QuickAction icon={FileText} label="Send Offer" onClick={onOffer} variant="success" />
        <QuickAction icon={Calendar} label="Schedule" onClick={onSchedule} />
        <QuickAction icon={ArrowRight} label="View Deal" onClick={onView} />
      </div>
    </div>
  );
}

export function TodaysFocus({ deals, isLoading }: TodaysFocusProps) {
  const navigate = useNavigate();

  // Handlers
  const handleView = (dealId: string) => {
    navigate(`/properties/${dealId}`);
  };

  const handleCall = (deal: FocusDeal) => {
    if (deal.owner_phone) {
      window.open(`tel:${deal.owner_phone}`, "_self");
    } else {
      navigate(`/properties/${deal.id}?action=call`);
    }
  };

  const handleText = (deal: FocusDeal) => {
    if (deal.owner_phone) {
      window.open(`sms:${deal.owner_phone}`, "_self");
    } else {
      navigate(`/properties/${deal.id}?action=text`);
    }
  };

  const handleOffer = (dealId: string) => {
    navigate(`/properties/${dealId}?action=offer`);
  };

  const handleSchedule = (dealId: string) => {
    navigate(`/properties/${dealId}?action=schedule`);
  };

  if (isLoading) {
    return (
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border-subtle bg-gradient-to-r from-primary/5 to-transparent">
          <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <Card variant="default" padding="none" className="overflow-hidden border-success/20">
        <div className="flex items-center gap-2 p-4 border-b border-success/20 bg-gradient-to-r from-success/5 to-transparent">
          <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-success" />
          </div>
          <div>
            <h3 className="text-body font-semibold text-foreground">Today's Focus</h3>
            <p className="text-tiny text-muted-foreground">AI-prioritized deals</p>
          </div>
        </div>
        <div className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="text-small text-muted-foreground">
            No urgent deals right now. You're on track!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className="overflow-hidden border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-body font-semibold text-foreground">Today's Focus</h3>
            <p className="text-tiny text-muted-foreground">
              Top {deals.length} deals by profit, urgency & momentum
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" />
          AI Ranked
        </Badge>
      </div>

      {/* Deal list */}
      <div className="divide-y divide-border-subtle">
        {deals.slice(0, 3).map((deal, index) => (
          <FocusDealItem
            key={deal.id}
            deal={deal}
            rank={index + 1}
            onView={() => handleView(deal.id)}
            onCall={() => handleCall(deal)}
            onText={() => handleText(deal)}
            onOffer={() => handleOffer(deal.id)}
            onSchedule={() => handleSchedule(deal.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div 
        className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors"
        onClick={() => navigate("/pipeline")}
      >
        <span>View Full Pipeline</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </Card>
  );
}

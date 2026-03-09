import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Flame, ArrowRight, Phone, Mail } from "lucide-react";
import type { HotOpportunityEnhanced } from "@/hooks/useDashboardInsights";

// Enhanced Hot Opportunity Item
function EnhancedHotOpportunityItem({
  opportunity,
  onClick,
  onCall,
  onEmail,
}: {
  opportunity: HotOpportunityEnhanced;
  onClick: () => void;
  onCall: (e: React.MouseEvent) => void;
  onEmail: (e: React.MouseEvent) => void;
}) {
  const score = opportunity.motivation_score || 0;
  const scoreColor = score > 800 ? "bg-destructive text-destructive-foreground"
    : score > 500 ? "bg-warning text-warning-foreground"
    : "bg-muted text-muted-foreground";

  const getHotReason = (): { label: string; color: string } | null => {
    if (opportunity.profit_potential && opportunity.profit_potential > 50000) {
      return { label: "Top Profit", color: "bg-success/10 text-success" };
    }
    if (opportunity.urgency_reason?.includes("🔥") ||
        (opportunity.motivation_score && opportunity.motivation_score > 800)) {
      return { label: "Most Urgent", color: "bg-destructive/10 text-destructive" };
    }
    if (opportunity.deal_score_rank === "🏆 Top Deal" || score > 700) {
      return { label: "Best Score", color: "bg-amber-100 text-amber-700" };
    }
    if (opportunity.equity_percent && opportunity.equity_percent > 40) {
      return { label: `${Math.round(opportunity.equity_percent)}% Equity`, color: "bg-info/10 text-info" };
    }
    if (opportunity.days_since_added <= 1) {
      return { label: "Fresh Lead", color: "bg-accent/10 text-accent" };
    }
    if (score > 500) {
      return { label: "High Score", color: "bg-muted text-muted-foreground" };
    }
    return null;
  };

  const hotReason = getHotReason();

  return (
    <div
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group hover:shadow-sm"
      onClick={onClick}
    >
      <span className={cn("text-[11px] font-medium px-1.5 py-px rounded-full shrink-0 leading-tight", scoreColor)}>
        {score}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {opportunity.address}
        </p>
        <p className="text-tiny text-muted-foreground truncate">
          {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
        </p>
      </div>
      {hotReason && (
        <span className={cn("text-[11px] font-medium px-1.5 py-px rounded-full whitespace-nowrap shrink-0 leading-tight", hotReason.color)}>
          {hotReason.label}
        </span>
      )}
    </div>
  );
}

// Legacy fallback item
function LegacyHotOpportunityItem({
  opportunity,
  onClick,
  onCall,
  onEmail,
}: {
  opportunity: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    motivation_score: number | null;
    status: string | null;
    updated_at: string | null;
    owner_phone: string | null;
    owner_email: string | null;
  };
  onClick: () => void;
  onCall: (e: React.MouseEvent) => void;
  onEmail: (e: React.MouseEvent) => void;
}) {
  const score = opportunity.motivation_score || 0;
  const scoreColor = score > 800 ? "bg-destructive text-destructive-foreground"
    : score > 500 ? "bg-warning text-warning-foreground"
    : "bg-muted text-muted-foreground";

  const daysSinceUpdate = opportunity.updated_at
    ? Math.floor((Date.now() - new Date(opportunity.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColor = {
    new: "bg-red-100 text-red-600",
    contacted: "bg-red-50 text-red-500",
    appointment: "bg-red-50 text-red-400",
    offer_made: "bg-amber-100 text-amber-600",
    negotiating: "bg-amber-50 text-amber-500",
    under_contract: "bg-blue-100 text-blue-600",
    closed: "bg-emerald-100 text-emerald-600",
    dead: "bg-destructive/10 text-destructive",
  }[opportunity.status || "new"] || "bg-red-100 text-red-600";

  return (
    <div
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group hover:shadow-sm"
      onClick={onClick}
    >
      <span className={cn("text-[11px] font-medium px-1.5 py-px rounded-full shrink-0 leading-tight", scoreColor)}>
        {score}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {opportunity.address}
        </p>
        <p className="text-tiny text-muted-foreground">
          {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
        </p>
      </div>
      {daysSinceUpdate !== null && (
        <div className="text-tiny text-muted-foreground whitespace-nowrap tabular-nums">
          {daysSinceUpdate === 0 ? "Today" : daysSinceUpdate === 1 ? "1 day" : `${daysSinceUpdate}d`}
        </div>
      )}
      <span className={cn("text-[11px] font-medium px-1.5 py-px rounded-full capitalize leading-tight transition-all duration-150", statusColor)}>
        {(opportunity.status || "new").replace("_", " ")}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-2 group-hover:translate-x-0">
        <button onClick={onCall} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" title="Call">
          <Phone className="h-4 w-4" />
        </button>
        <button onClick={onEmail} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" title="Email">
          <Mail className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface HotOpportunitiesCardProps {
  opportunities: HotOpportunityEnhanced[] | any[];
  isLoading: boolean;
}

export function HotOpportunitiesCard({ opportunities, isLoading }: HotOpportunitiesCardProps) {
  const navigate = useNavigate();

  const handleCall = (e: React.MouseEvent, phone: string | null) => {
    e.stopPropagation();
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleEmail = (e: React.MouseEvent, email: string | null) => {
    e.stopPropagation();
    if (email) window.location.href = `mailto:${email}`;
  };

  return (
    <Card variant="default" padding="none" className="overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-destructive/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-destructive/10">
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-body font-semibold text-foreground">Hot Opportunities</h2>
            <p className="text-tiny text-muted-foreground">Top 10% by profit, urgency, or score</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/properties")}>
          View All
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
      <div className="overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="p-4 space-y-3 flex-1">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 flex-1">
            {opportunities?.slice(0, 11).map((opp) => {
              const enhanced = 'urgency_reason' in opp ? opp as HotOpportunityEnhanced : null;
              if (enhanced) {
                return (
                  <EnhancedHotOpportunityItem
                    key={enhanced.id}
                    opportunity={enhanced}
                    onClick={() => navigate(`/properties/${enhanced.id}`)}
                    onCall={(e) => handleCall(e, enhanced.owner_phone)}
                    onEmail={(e) => handleEmail(e, enhanced.owner_email)}
                  />
                );
              }
              return (
                <LegacyHotOpportunityItem
                  key={opp.id}
                  opportunity={opp}
                  onClick={() => navigate(`/properties/${opp.id}`)}
                  onCall={(e) => handleCall(e, opp.owner_phone)}
                  onEmail={(e) => handleEmail(e, opp.owner_email)}
                />
              );
            })}
          </div>
        )}
        {!isLoading && opportunities && opportunities.length > 11 && (
          <div
            className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors mt-auto"
            onClick={() => navigate("/properties?sort=motivation_score")}
          >
            <span>+{opportunities.length - 11} More Opportunities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </Card>
  );
}

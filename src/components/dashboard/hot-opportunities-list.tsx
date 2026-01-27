import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, ArrowRight, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  calculateVelocityScore,
  getDefaultVelocityData,
} from "@/lib/velocity-scoring";

interface Opportunity {
  id: string | number;
  address: string;
  city: string;
  state: string;
  score: number;
  daysAgo: number;
  distress_signals?: string[];
}

interface HotOpportunitiesListProps {
  opportunities: Opportunity[];
  onViewAll?: () => void;
  onCall?: (id: string | number) => void;
  onView?: (id: string | number) => void;
}

function getScoreColor(score: number): { border: string; text: string; bg: string } {
  if (score >= 80) return { border: "border-score-hot", text: "text-score-hot", bg: "bg-score-hot/10" };
  if (score >= 60) return { border: "border-score-warm", text: "text-score-warm", bg: "bg-score-warm/10" };
  if (score >= 40) return { border: "border-score-moderate", text: "text-score-moderate", bg: "bg-score-moderate/10" };
  if (score >= 20) return { border: "border-score-cool", text: "text-score-cool", bg: "bg-score-cool/10" };
  return { border: "border-score-cold", text: "text-score-cold", bg: "bg-score-cold/10" };
}

function getVelocityColor(level: string): { bg: string; text: string } {
  switch (level) {
    case "CRITICAL":
      return { bg: "bg-destructive", text: "text-white" };
    case "HIGH":
      return { bg: "bg-warning", text: "text-warning-foreground" };
    case "STANDARD":
      return { bg: "bg-info", text: "text-info-foreground" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground" };
  }
}

function MotivationScoreCircle({ score }: { score: number }) {
  const colors = getScoreColor(score);
  
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-[3px]",
        colors.border,
        colors.bg
      )}
    >
      <span className={cn("text-small font-semibold", colors.text)}>
        {score}
      </span>
    </div>
  );
}

export function HotOpportunitiesList({
  opportunities,
  onViewAll,
  onCall,
  onView,
}: HotOpportunitiesListProps) {
  // Calculate velocity scores and sort by them
  const opportunitiesWithVelocity = React.useMemo(() => {
    return opportunities.map((opp) => {
      const velocityData = getDefaultVelocityData({
        motivation_score: opp.score,
        distress_signals: opp.distress_signals,
      });
      const velocityResult = calculateVelocityScore(velocityData);
      return { ...opp, velocity: velocityResult };
    }).sort((a, b) => b.velocity.score - a.velocity.score);
  }, [opportunities]);

  // Separate critical velocity items
  const criticalItems = opportunitiesWithVelocity.filter(
    (opp) => opp.velocity.urgency_level === "CRITICAL"
  );
  const otherItems = opportunitiesWithVelocity.filter(
    (opp) => opp.velocity.urgency_level !== "CRITICAL"
  );

  return (
    <div>
      {/* Critical Velocity Section */}
      {criticalItems.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-small font-semibold text-destructive">
              🚨 Critical Velocity ({criticalItems.length})
            </span>
          </div>
          <div className="space-y-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            {criticalItems.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="flex items-center gap-4 p-3 rounded-medium bg-white transition-colors hover:bg-destructive/5 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Score Circle */}
                <MotivationScoreCircle score={opportunity.score} />

                {/* Address Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-body font-medium text-content truncate">
                    {opportunity.address}
                  </div>
                  <div className="text-small text-content-secondary">
                    {opportunity.city}, {opportunity.state}
                  </div>
                </div>

                {/* Velocity Badge */}
                <Badge variant="error" size="sm" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {opportunity.velocity.score}
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onCall?.(opportunity.id)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onView?.(opportunity.id)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 font-semibold text-content flex items-center gap-2">
          Hot Opportunities <span>🔥</span>
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-small text-brand-accent hover:underline transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {otherItems.map((opportunity, index) => {
          const velocityColors = getVelocityColor(opportunity.velocity.urgency_level);
          
          return (
            <div
              key={opportunity.id}
              className="flex items-center gap-4 p-3 rounded-medium transition-colors hover:bg-surface-secondary group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Score Circle */}
              <MotivationScoreCircle score={opportunity.score} />

              {/* Address Info */}
              <div className="flex-1 min-w-0">
                <div className="text-body font-medium text-content truncate">
                  {opportunity.address}
                </div>
                <div className="text-small text-content-secondary">
                  {opportunity.city}, {opportunity.state}
                </div>
              </div>

              {/* Velocity Score */}
              <div className="flex items-center gap-1.5">
                <Zap className={cn("h-3.5 w-3.5", 
                  opportunity.velocity.urgency_level === "HIGH" ? "text-warning" :
                  opportunity.velocity.urgency_level === "STANDARD" ? "text-info" :
                  "text-muted-foreground"
                )} />
                <span className={cn("text-small font-semibold tabular-nums",
                  opportunity.velocity.urgency_level === "HIGH" ? "text-warning" :
                  opportunity.velocity.urgency_level === "STANDARD" ? "text-info" :
                  "text-muted-foreground"
                )}>
                  {opportunity.velocity.score}
                </span>
              </div>

              {/* Days Ago */}
              <div className="text-tiny text-content-tertiary whitespace-nowrap">
                {opportunity.daysAgo === 0
                  ? "Today"
                  : opportunity.daysAgo === 1
                  ? "Yesterday"
                  : `${opportunity.daysAgo}d ago`}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onCall?.(opportunity.id)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onView?.(opportunity.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

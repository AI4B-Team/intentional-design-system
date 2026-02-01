import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Calendar,
  Phone,
  FileText,
  Target,
} from "lucide-react";
import { useDailySummary } from "@/hooks/useDailySummary";
import { format } from "date-fns";

// Priority color mapping
const PRIORITY_STYLES = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-info/10 text-info border-info/20",
};

// Action icon mapping
const ACTION_ICONS: Record<string, React.ElementType> = {
  "Make first contact": Phone,
  "Schedule appointment": Calendar,
  "Present offer": FileText,
  "Follow up on offer": Phone,
  "Re-engage seller": Phone,
  "Close the deal": Target,
  "Complete due diligence": FileText,
  "Find buyer": Target,
  "Review and update": FileText,
  "Take action": ArrowRight,
};

interface DailySummaryProps {
  variant?: "full" | "compact";
}

export function DailySummary({ variant = "full" }: DailySummaryProps) {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useDailySummary();

  // Determine if it's evening (after 5pm) for "End of Day" vs "Daily" framing
  const hour = new Date().getHours();
  const isEvening = hour >= 17;
  const TimeIcon = isEvening ? Moon : Sun;
  const headerText = isEvening ? "End of Day Summary" : "Today's Progress";

  if (isLoading) {
    return (
      <Card variant="default" padding="none" className="overflow-hidden animate-pulse">
        <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-5 w-40 bg-muted rounded" />
        </div>
        <div className="p-4 space-y-4">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
        </div>
      </Card>
    );
  }

  if (!summary) return null;

  const hasHighlights = summary.highlights.length > 0;
  const hasConcerns = summary.concerns.length > 0;
  const hasPriorities = summary.tomorrowPriorities.length > 0;

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            isEvening ? "bg-accent/10" : "bg-warning/10"
          )}>
            <TimeIcon className={cn(
              "h-4 w-4",
              isEvening ? "text-accent" : "text-warning"
            )} />
          </div>
          <div>
            <h3 className="text-body font-semibold text-foreground">{headerText}</h3>
            <p className="text-tiny text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
        </div>
        
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI Digest
        </Badge>
      </div>

      {/* Content */}
      <div className="divide-y divide-border-subtle">
        {/* Highlights Section */}
        {hasHighlights && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <h4 className="text-small font-semibold text-foreground">What Went Well</h4>
            </div>
            <div className="space-y-2">
              {summary.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-small text-foreground bg-success/5 rounded-lg px-3 py-2"
                >
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concerns Section */}
        {hasConcerns && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h4 className="text-small font-semibold text-foreground">Needs Attention</h4>
            </div>
            <div className="space-y-2">
              {summary.concerns.map((concern, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-small text-foreground bg-warning/5 rounded-lg px-3 py-2"
                >
                  <span>{concern}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stalled Deals */}
        {summary.stalled.length > 0 && variant === "full" && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-small font-semibold text-foreground">Stalling Deals</h4>
              <Badge variant="outline" className="text-tiny ml-auto">
                {summary.stalled.length} deals
              </Badge>
            </div>
            <div className="space-y-2">
              {summary.stalled.slice(0, 3).map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/properties/${deal.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium text-foreground truncate">
                      {deal.address}
                    </p>
                    <p className="text-tiny text-muted-foreground">
                      {deal.daysStalled} days in {deal.stage.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 text-tiny h-7">
                    {deal.suggestedAction}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow's Priorities */}
        {hasPriorities && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="text-small font-semibold text-foreground">
                {isEvening ? "Tomorrow's Focus" : "Today's Priorities"}
              </h4>
            </div>
            <div className="space-y-2">
              {summary.tomorrowPriorities.slice(0, variant === "compact" ? 3 : 5).map((priority, i) => {
                const ActionIcon = ACTION_ICONS[priority.action] || ArrowRight;
                return (
                  <div
                    key={priority.id}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      PRIORITY_STYLES[priority.priority]
                    )}
                    onClick={() => navigate(`/properties/${priority.id}`)}
                  >
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background text-tiny font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-small font-medium truncate">
                        {priority.address}
                      </p>
                      <p className="text-tiny opacity-80">
                        {priority.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-tiny font-medium shrink-0">
                      <ActionIcon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{priority.action}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Activity Fallback */}
        {!hasHighlights && !hasConcerns && !hasPriorities && (
          <div className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-small text-muted-foreground">
              No activity to summarize yet today. Get started!
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate("/pipeline")}
            >
              View Pipeline
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {variant === "full" && (
        <div className="px-4 pb-4">
          <Separator className="mb-4" />
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-h4 font-bold text-foreground">{summary.stats.totalDealsWorked}</p>
              <p className="text-tiny text-muted-foreground">Deals Touched</p>
            </div>
            <div>
              <p className="text-h4 font-bold text-foreground">{summary.stats.callsMade}</p>
              <p className="text-tiny text-muted-foreground">Calls Made</p>
            </div>
            <div>
              <p className="text-h4 font-bold text-foreground">{summary.stats.offersSent}</p>
              <p className="text-tiny text-muted-foreground">Offers Sent</p>
            </div>
            <div>
              <p className="text-h4 font-bold text-success">{summary.stats.dealsWon}</p>
              <p className="text-tiny text-muted-foreground">Deals Won</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

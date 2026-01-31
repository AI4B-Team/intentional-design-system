import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Phone, 
  Clock, 
  Flame, 
  ChevronRight,
  CheckCircle2,
  Target
} from "lucide-react";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";

interface FocusItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  count: number;
  action: string;
  onClick: () => void;
  priority: "critical" | "high" | "medium";
}

export function DailyFocus() {
  const navigate = useNavigate();
  const { data: insights, isLoading } = useDashboardInsights();

  // Build focus items from insights
  const focusItems: FocusItem[] = React.useMemo(() => {
    if (!insights) return [];

    const items: FocusItem[] = [];

    // Leads needing first contact
    if (insights.leadsInsight && insights.leadsInsight.count && insights.leadsInsight.count > 0) {
      const count = insights.leadsInsight.count;
      items.push({
        id: "leads-contact",
        icon: Phone,
        iconColor: "text-destructive",
        iconBg: "bg-destructive/10",
        label: count === 1 ? "Lead Needs First Contact" : "Leads Need First Contact",
        count,
        action: "Call Now",
        onClick: () => navigate("/properties?status=new&sort=created_at"),
        priority: count > 5 ? "critical" : "high",
      });
    }

    // Offers awaiting response
    if (insights.offersInsight && insights.offersInsight.count && insights.offersInsight.count > 0) {
      const count = insights.offersInsight.count;
      items.push({
        id: "offers-pending",
        icon: Clock,
        iconColor: "text-warning",
        iconBg: "bg-warning/10",
        label: count === 1 ? "Offer Awaiting Response" : "Offers Awaiting Response",
        count,
        action: "Follow Up",
        onClick: () => navigate("/properties?status=offer_made"),
        priority: count > 3 ? "critical" : "high",
      });
    }

    // Hot deals (top opportunities that need action)
    const hotDeals = insights.hotOpportunities?.filter(
      (opp) => opp.urgency_reason?.includes("🔥") || opp.deal_score_rank === "🏆 Top Deal"
    );
    if (hotDeals && hotDeals.length > 0) {
      const count = hotDeals.length;
      items.push({
        id: "hot-deals",
        icon: Flame,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-100",
        label: count === 1 ? "Hot Deal Needs Action" : "Hot Deals Need Action",
        count,
        action: "View Deals",
        onClick: () => navigate("/pipeline"),
        priority: "high",
      });
    }

    // Stalling deals
    if (insights.stallingCount > 0) {
      const count = insights.stallingCount;
      items.push({
        id: "stalling",
        icon: Clock,
        iconColor: "text-muted-foreground",
        iconBg: "bg-muted",
        label: count === 1 ? "Deal Stalling" : "Deals Stalling",
        count,
        action: "Re-Engage",
        onClick: () => navigate("/properties?status=contacted&sort=updated_at"),
        priority: "medium",
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2 };
    return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [insights, navigate]);

  // All clear state
  const allClear = focusItems.length === 0 && !isLoading;

  if (isLoading) {
    return (
      <Card variant="default" padding="md" className="mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-5 w-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant="default" 
      padding="none" 
      className={cn(
        "mb-6 overflow-hidden",
        allClear ? "border-success/30" : "border-primary/20"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 border-b",
        allClear 
          ? "bg-gradient-to-r from-success/5 to-transparent border-success/20" 
          : "bg-gradient-to-r from-primary/5 to-transparent border-border-subtle"
      )}>
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          allClear ? "bg-success/10" : "bg-primary/10"
        )}>
          {allClear ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Target className="h-4 w-4 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-small font-semibold text-foreground">Today's Focus</h3>
          <p className="text-tiny text-muted-foreground">
            {allClear 
              ? "You're all caught up! Great work." 
              : `${focusItems.length} action${focusItems.length !== 1 ? "s" : ""} need your attention`
            }
          </p>
        </div>
      </div>

      {/* Focus Items */}
      {!allClear && (
        <div className="divide-y divide-border-subtle">
          {focusItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-background-secondary transition-colors cursor-pointer group"
              onClick={item.onClick}
            >
              {/* Icon */}
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                item.iconBg
              )}>
                <item.icon className={cn("h-4 w-4", item.iconColor)} />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-small text-foreground">
                  <span className="font-bold tabular-nums">{item.count}</span>{" "}
                  <span>{item.label}</span>
                </p>
                {item.priority === "critical" && (
                  <p className="text-tiny text-destructive font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Critical priority
                  </p>
                )}
              </div>

              {/* Action Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                }}
              >
                {item.action}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* All Clear State */}
      {allClear && (
        <div className="px-4 py-6 text-center">
          <p className="text-small text-muted-foreground">
            No urgent actions right now. Check back later or explore your pipeline.
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
    </Card>
  );
}

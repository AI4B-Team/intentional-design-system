import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useHotOpportunities } from "@/hooks/useHotOpportunities";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { usePipelineValueStats } from "@/hooks/usePipelineValueStats";
import { useTodaysTasks } from "@/hooks/useTodaysTasks";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useDashboardInsights, type ActionInsight, type HotOpportunityEnhanced } from "@/hooks/useDashboardInsights";

import { GoalSettingsDialog, useGoals } from "@/components/dashboard/GoalSettingsDialog";
import { DailyFocus } from "@/components/dashboard/DailyFocus";
import {
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Flame,
  Clock,
  ArrowRight,
  Plus,
  Send,
  UserCheck,
  CalendarCheck,
  Users,
  Handshake,
  BadgeDollarSign,
  Target,
  Settings2,
  AlertTriangle,
  Zap,
  DollarSign,
  Hourglass,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Format currency helper
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

// Pipeline Value Card Component
interface PipelineValueCardProps {
  title: string;
  subtitle?: string; // e.g. "Locked Deals", "In Escrow"
  count: number;
  totalValue: number;
  profitPotential: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  profitLabel?: string;
  valueLabel?: string; // e.g. "Revenue Secured"
  isLoading?: boolean;
  onClick?: () => void;
  goal?: number;
  actionInsight?: ActionInsight | null;
  variant?: "default" | "calm" | "celebration"; // calm = contracts, celebration = sold
  nextExpectedClose?: number; // days until next expected close
  lastClosedDaysAgo?: number; // days since last deal closed
  contextLine?: string; // optional context line text (no emoji)
  contextIcon?: React.ElementType; // optional icon for context line
  contextSeverity?: "reminder" | "attention" | "blocking"; // Severity ladder: blue, amber, red
}

function PipelineValueCard({ 
  title, 
  subtitle,
  count, 
  totalValue, 
  profitPotential, 
  icon: Icon, 
  iconBg, 
  iconColor,
  profitLabel = "Profit Potential",
  valueLabel = "Total Value",
  isLoading,
  onClick,
  goal = 0,
  actionInsight,
  variant = "default",
  nextExpectedClose,
  lastClosedDaysAgo,
  contextLine,
  contextIcon: ContextIcon,
  contextSeverity = "reminder",
}: PipelineValueCardProps) {
  const goalProgress = goal > 0 ? Math.min(Math.round((count / goal) * 100), 100) : 0;
  const hasGoal = goal > 0;
  const goalGap = goal > 0 && count < goal ? goal - count : 0;

  if (isLoading) {
    return (
      <Card variant="default" padding="md" className="animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-16" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  // Calm variant uses green/success styling for "relief" tiles like Contracts
  const isCalmVariant = variant === "calm";

  return (
    <Card 
      variant="default" 
      padding="md" 
      className={cn(
        "group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full",
        onClick && "cursor-pointer",
        isCalmVariant && "border-success/20"
      )}
      onClick={onClick}
    >
      {/* Gradient overlay - calmer green for contracts */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        isCalmVariant 
          ? "bg-gradient-to-br from-transparent via-transparent to-success/5" 
          : "bg-gradient-to-br from-transparent via-transparent to-primary/5"
      )} />
      
      <div className="relative flex flex-col h-full">
        {/* Header with optional subtitle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-small text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
            {subtitle && (
              <p className={cn(
                "text-tiny mt-0.5",
                isCalmVariant ? "text-success/70" : "text-muted-foreground/70"
              )}>{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
            iconBg
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>

        {/* Count with Goal */}
        <div className="mt-4">
          <p className="text-[2.5rem] font-bold text-foreground tabular-nums leading-none">
            {count}
          </p>
          {hasGoal && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-tiny mb-1">
                <span className="text-muted-foreground">Goal: {goal}</span>
                <span className={cn(
                  "font-medium",
                  goalProgress >= 100 ? "text-success" : goalProgress >= 50 ? "text-warning" : "text-muted-foreground"
                )}>
                  {goalProgress}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    // Calm variant always uses success color for progress
                    isCalmVariant 
                      ? "bg-success" 
                      : goalProgress >= 75 ? "bg-success" : goalProgress >= 40 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle content - flex-1 to push bottom metrics down */}
        <div className="flex-1 mt-3 space-y-2">
          {/* Context line - styled by severity: blue=reminder, amber=attention, red=blocking */}
          {contextLine && (
            <div className={cn(
              "flex items-center gap-1.5 text-tiny",
              contextSeverity === "blocking" 
                ? "text-destructive" 
                : contextSeverity === "attention"
                ? "text-warning"
                : "text-info" // reminder = blue
            )}>
              {ContextIcon && <ContextIcon className="h-3 w-3 shrink-0" />}
              <span>{contextLine}</span>
            </div>
          )}

          {/* Next expected close for contracts - with clock icon inline */}
          {nextExpectedClose !== undefined && nextExpectedClose > 0 && (
            <div className="flex items-center gap-1.5 text-tiny text-muted-foreground uppercase tracking-wide">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Next Expected Close: {nextExpectedClose} {nextExpectedClose === 1 ? "Day" : "Days"}</span>
            </div>
          )}



          {/* Goal gap context for celebration variant */}
          {variant === "celebration" && goalGap > 0 && (
            <div className="flex items-center gap-1.5 text-tiny text-muted-foreground">
              <BarChart3 className="h-3 w-3 shrink-0" />
              <span>{goalGap} {goalGap === 1 ? "Deal" : "Deals"} Needed To Hit Goal</span>
            </div>
          )}

          {/* Action Insight - Severity Ladder: Blue=reminder, Amber=attention, Red=blocking */}
          {actionInsight && variant === "default" && (
            <div className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-tiny font-medium",
              actionInsight.severity === "high" 
                ? "bg-warning/10 text-warning" // Amber = attention
                : actionInsight.severity === "medium"
                ? "bg-warning/10 text-warning" // Amber = attention
                : "bg-info/10 text-info" // Blue = reminder
            )}>
              {actionInsight.severity === "high" && <AlertTriangle className="h-3 w-3" />}
              {actionInsight.severity === "medium" && <Clock className="h-3 w-3" />}
              {actionInsight.severity === "low" && <Clock className="h-3 w-3" />}
              <span className="truncate">{actionInsight.label}</span>
            </div>
          )}
        </div>

        {/* Value and Profit - Always at bottom with mt-auto */}
        <div className="space-y-2 pt-2 border-t border-border-subtle mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-tiny text-muted-foreground uppercase">{valueLabel}</span>
            <span className="text-small font-semibold text-foreground tabular-nums">
              {formatCurrency(totalValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tiny text-muted-foreground uppercase">{profitLabel}</span>
            <span className="text-small font-bold text-success tabular-nums">
              {formatCurrency(profitPotential)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ElementType;
  iconBg: string;
  isLoading?: boolean;
  invertTrend?: boolean;
}

function StatCard({ title, value, trend, icon: Icon, iconBg, isLoading, invertTrend }: StatCardProps) {
  const isPositive = invertTrend ? trend <= 0 : trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  if (isLoading) {
    return (
      <Card variant="default" padding="md" className="animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant="default" 
      padding="md" 
      className="group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-small text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
          <p className="text-[2rem] font-bold text-foreground tabular-nums leading-tight">{value.toLocaleString()}</p>
          <div className={cn(
            "inline-flex items-center gap-1.5 text-small font-medium px-2 py-0.5 rounded-full",
            isPositive 
              ? "text-success bg-success/10" 
              : "text-destructive bg-destructive/10"
          )}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105",
          iconBg
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

// Enhanced Hot Opportunity Item with "why it's hot" context
interface EnhancedHotOpportunityItemProps {
  opportunity: HotOpportunityEnhanced;
  onClick: () => void;
  onCall: (e: React.MouseEvent) => void;
  onEmail: (e: React.MouseEvent) => void;
}

function EnhancedHotOpportunityItem({ opportunity, onClick, onCall, onEmail }: EnhancedHotOpportunityItemProps) {
  const score = opportunity.motivation_score || 0;
  const scoreColor = score > 800 ? "bg-destructive text-destructive-foreground" 
    : score > 500 ? "bg-warning text-warning-foreground" 
    : "bg-muted text-muted-foreground";

  // Single "why it's hot" reason - specific labels based on WHY it's hot
  const getHotReason = (): { label: string; color: string } | null => {
    // Priority order: Most specific reason first
    
    // High profit potential = "Top Profit"
    if (opportunity.profit_potential && opportunity.profit_potential > 50000) {
      return { label: "Top Profit", color: "bg-success/10 text-success" };
    }
    
    // Urgency signals = "Most Urgent"
    if (opportunity.urgency_reason?.includes("🔥") || 
        (opportunity.motivation_score && opportunity.motivation_score > 800)) {
      return { label: "Most Urgent", color: "bg-destructive/10 text-destructive" };
    }
    
    // Top deal by score = "Best Score"
    if (opportunity.deal_score_rank === "🏆 Top Deal" || score > 700) {
      return { label: "Best Score", color: "bg-amber-100 text-amber-700" };
    }
    
    // High equity = show percentage
    if (opportunity.equity_percent && opportunity.equity_percent > 40) {
      return { label: `${Math.round(opportunity.equity_percent)}% Equity`, color: "bg-info/10 text-info" };
    }
    
    // Fresh lead
    if (opportunity.days_since_added <= 1) {
      return { label: "Fresh Lead", color: "bg-accent/10 text-accent" };
    }
    
    // Above average score
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
      {/* Score Badge */}
      <div className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-full text-tiny font-bold min-w-[56px] justify-center shadow-sm transition-transform duration-150 group-hover:scale-105",
        scoreColor
      )}>
        {score > 800 && <Flame className="h-3 w-3 animate-pulse" />}
        {score}
      </div>

      {/* Address */}
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {opportunity.address}
        </p>
        <p className="text-tiny text-muted-foreground truncate">
          {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
        </p>
      </div>

      {/* Single "Why It's Hot" Badge - One reason only */}
      {hotReason && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-tiny font-medium whitespace-nowrap shrink-0",
          hotReason.color
        )}>
          {hotReason.label}
        </span>
      )}

      {/* Quick Actions - Always visible, before the pill */}
      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={onCall}
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground"
          title="Call"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button 
          onClick={onEmail}
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground"
          title="Email"
        >
          <Mail className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Helper for compact currency
function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString();
}

// Legacy Hot Opportunity Item (fallback)
interface HotOpportunityItemProps {
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
}

function HotOpportunityItem({ opportunity, onClick, onCall, onEmail }: HotOpportunityItemProps) {
  const score = opportunity.motivation_score || 0;
  const scoreColor = score > 800 ? "bg-destructive text-destructive-foreground" 
    : score > 500 ? "bg-warning text-warning-foreground" 
    : "bg-muted text-muted-foreground";
  
  const daysSinceUpdate = opportunity.updated_at 
    ? Math.floor((Date.now() - new Date(opportunity.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColor = {
    new: "bg-muted text-muted-foreground",
    contacted: "bg-info/10 text-info",
    appointment: "bg-warning/10 text-warning",
    offer_made: "bg-accent/10 text-accent",
    under_contract: "bg-chart-4/10 text-chart-4",
    closed: "bg-success/10 text-success",
    dead: "bg-destructive/10 text-destructive",
  }[opportunity.status || "new"] || "bg-muted text-muted-foreground";

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group hover:shadow-sm"
      onClick={onClick}
    >
      {/* Score Badge */}
      <div className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-full text-tiny font-bold min-w-[56px] justify-center shadow-sm transition-transform duration-150 group-hover:scale-105",
        scoreColor
      )}>
        {score > 800 && <Flame className="h-3 w-3 animate-pulse" />}
        {score}
      </div>

      {/* Address */}
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {opportunity.address}
        </p>
        <p className="text-tiny text-muted-foreground">
          {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
        </p>
      </div>

      {/* Days Since Contact */}
      {daysSinceUpdate !== null && (
        <div className="text-tiny text-muted-foreground whitespace-nowrap tabular-nums">
          {daysSinceUpdate === 0 ? "Today" : daysSinceUpdate === 1 ? "1 day" : `${daysSinceUpdate}d`}
        </div>
      )}

      {/* Status */}
      <span className={cn("px-2 py-0.5 rounded-full text-tiny font-medium capitalize transition-all duration-150", statusColor)}>
        {(opportunity.status || "new").replace("_", " ")}
      </span>

      {/* Quick Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={onCall}
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
          title="Call"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button 
          onClick={onEmail}
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
          title="Email"
        >
          <Mail className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Pipeline Stage with bottleneck visual pressure
interface PipelineStageProps {
  stage: {
    status: string;
    label: string;
    count: number;
    color: string;
  };
  total: number;
  previousCount: number;
  onClick: () => void;
  isBottleneck?: boolean;
  bottleneckReason?: string;
}

function PipelineStage({ stage, total, previousCount, onClick, isBottleneck, bottleneckReason }: PipelineStageProps) {
  const conversionRate = previousCount > 0 ? Math.round((stage.count / previousCount) * 100) : 0;
  const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;
  
  // Visual pressure: empty stage after populated stage feels uncomfortable
  const isEmpty = stage.count === 0;
  const showPressure = isEmpty && previousCount > 0;

  // Generate "No X" message for empty stages
  const emptyMessage = isEmpty ? `No ${stage.label.toLowerCase()}` : null;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150 group",
        showPressure 
          ? "bg-warning/5 hover:bg-warning/10 border border-warning/20" // Amber = attention (gap needs attention, not blocking)
          : "hover:bg-background-secondary"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-3 h-3 rounded-full shadow-sm transition-transform duration-150 group-hover:scale-125", 
        stage.color
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-small font-medium group-hover:text-primary transition-colors truncate",
            showPressure ? "text-warning" : "text-foreground"
          )}>
            {stage.label}
          </p>
          {showPressure && (
            <span className="text-tiny bg-warning/10 text-warning px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shrink-0">
              <AlertTriangle className="h-2.5 w-2.5" />
              Gap
            </span>
          )}
          {isBottleneck && !showPressure && (
            <span className="text-tiny bg-info/10 text-info px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shrink-0">
              <Clock className="h-2.5 w-2.5" />
              Slow
            </span>
          )}
        </div>
        {showPressure && emptyMessage && (
          <p className="text-tiny text-destructive/70 mt-0.5">{emptyMessage} — needs attention</p>
        )}
        {bottleneckReason && !showPressure && (
          <p className="text-tiny text-warning/80 mt-0.5">{bottleneckReason}</p>
        )}
      </div>
      <div className="text-right flex items-center gap-3">
        <div className="w-16 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300", 
              showPressure ? "bg-destructive/30" : stage.color
            )} 
            style={{ width: showPressure ? "100%" : `${percentage}%` }}
          />
        </div>
        <p className={cn(
          "text-body font-bold tabular-nums w-8 text-right",
          showPressure ? "text-destructive" : "text-foreground"
        )}>
          {stage.count}
        </p>
        {previousCount > 0 && conversionRate > 0 && !showPressure && (
          <p className="text-tiny text-muted-foreground w-12 text-right">{conversionRate}%</p>
        )}
        {showPressure && (
          <p className="text-tiny text-destructive w-12 text-right">0%</p>
        )}
      </div>
    </div>
  );
}

// Task Item
interface TaskItemProps {
  task: {
    id: string;
    type: "appointment" | "followup";
    title: string;
    time: string | null;
    propertyId: string;
    completed: boolean;
  };
  onToggle: (id: string) => void;
  onClick: () => void;
}

function TaskItem({ task, onToggle, onClick }: TaskItemProps) {
  const Icon = task.type === "appointment" ? CalendarCheck : Phone;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-150 group",
      task.completed 
        ? "bg-background-secondary/50" 
        : "hover:bg-background-secondary hover:shadow-sm"
    )}>
      <Checkbox 
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 transition-transform duration-150 hover:scale-110"
      />
      <div className={cn(
        "p-1.5 rounded-md transition-all duration-150",
        task.completed ? "opacity-50" : "",
        task.type === "appointment" ? "bg-warning/10" : "bg-info/10"
      )}>
        <Icon className={cn(
          "h-4 w-4",
          task.type === "appointment" ? "text-warning" : "text-info"
        )} />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <p className={cn(
          "text-small font-medium truncate transition-colors",
          task.completed 
            ? "text-muted-foreground line-through" 
            : "text-foreground group-hover:text-primary"
        )}>
          {task.title}
        </p>
      </div>
      {task.time && (
        <div className={cn(
          "flex items-center gap-1.5 text-tiny px-2 py-0.5 rounded-full",
          task.completed ? "text-muted-foreground" : "text-muted-foreground bg-background-secondary"
        )}>
          <Clock className="h-3 w-3" />
          {task.time}
        </div>
      )}
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-2 group-hover:translate-x-0 cursor-pointer" onClick={onClick} />
    </div>
  );
}

// Activity Item
interface ActivityItemProps {
  activity: {
    id: string;
    type: string;
    description: string;
    relativeTime: string;
    propertyId?: string;
  };
  onClick: () => void;
}

function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    property_added: { icon: Plus, color: "bg-success/10 text-success" },
    offer_sent: { icon: Send, color: "bg-accent/10 text-accent" },
    response_received: { icon: FileText, color: "bg-warning/10 text-warning" },
    appointment_scheduled: { icon: Calendar, color: "bg-info/10 text-info" },
    status_changed: { icon: UserCheck, color: "bg-chart-4/10 text-chart-4" },
  };

  const { icon: Icon, color } = iconMap[activity.type] || { icon: FileText, color: "bg-muted text-muted-foreground" };

  return (
    <div 
      className="flex items-start gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group"
      onClick={onClick}
    >
      <div className={cn("p-2 rounded-lg shadow-sm transition-transform duration-150 group-hover:scale-105", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small text-foreground line-clamp-2 group-hover:text-primary transition-colors">{activity.description}</p>
        <p className="text-tiny text-muted-foreground mt-1">{activity.relativeTime}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-150 mt-1 translate-x-2 group-hover:translate-x-0" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = React.useState<Set<string>>(new Set());
  const goals = useGoals();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: pipelineValueStatsRaw, isLoading: pipelineValueLoading } = usePipelineValueStats();
  const { data: hotOpportunities, isLoading: hotLoading } = useHotOpportunities(10);
  const { data: pipelineStats, isLoading: pipelineLoading } = usePipelineStats();
  const { data: todaysTasks, isLoading: tasksLoading } = useTodaysTasks();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(20);
  const { data: insights } = useDashboardInsights();

  // Demo data for visualization when no real data exists
  const demoData = {
    leads: { count: 42, totalValue: 7350000, profitPotential: 367500 },
    offers: { count: 12, totalValue: 2100000, profitPotential: 105000 },
    contracted: { count: 8, totalValue: 1400000, profitPotential: 84000 },
    sold: { count: 1, totalValue: 175000, profitPotential: 10500 },
  };

  // Demo hot opportunities for visualization
  const demoHotOpportunities: HotOpportunityEnhanced[] = [
    {
      id: "demo-1",
      address: "1842 Sunset Boulevard",
      city: "Los Angeles",
      state: "CA",
      motivation_score: 920,
      status: "new",
      updated_at: new Date().toISOString(),
      owner_phone: "(555) 123-4567",
      owner_email: "owner1@example.com",
      profit_potential: 78000,
      equity_percent: 45,
      days_since_added: 0,
      urgency_reason: "🔥 Motivated seller",
      deal_score_rank: "🏆 Top Deal",
      arv: 385000,
    },
    {
      id: "demo-2",
      address: "3921 Maple Street",
      city: "Phoenix",
      state: "AZ",
      motivation_score: 850,
      status: "contacted",
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      owner_phone: "(555) 234-5678",
      owner_email: "owner2@example.com",
      profit_potential: 62000,
      equity_percent: 38,
      days_since_added: 1,
      urgency_reason: "Pre-foreclosure",
      deal_score_rank: "",
      arv: 295000,
    },
    {
      id: "demo-3",
      address: "7845 Oak Avenue",
      city: "Dallas",
      state: "TX",
      motivation_score: 780,
      status: "new",
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      owner_phone: "(555) 345-6789",
      owner_email: "owner3@example.com",
      profit_potential: 55000,
      equity_percent: 52,
      days_since_added: 2,
      urgency_reason: null,
      deal_score_rank: "",
      arv: 265000,
    },
    {
      id: "demo-4",
      address: "2156 Cherry Lane",
      city: "Atlanta",
      state: "GA",
      motivation_score: 720,
      status: "appointment",
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      owner_phone: "(555) 456-7890",
      owner_email: "owner4@example.com",
      profit_potential: 48000,
      equity_percent: 35,
      days_since_added: 3,
      urgency_reason: "🔥 Divorce situation",
      deal_score_rank: "",
      arv: 225000,
    },
    {
      id: "demo-5",
      address: "9023 Birch Court",
      city: "Denver",
      state: "CO",
      motivation_score: 680,
      status: "new",
      updated_at: new Date(Date.now() - 345600000).toISOString(),
      owner_phone: "(555) 567-8901",
      owner_email: "owner5@example.com",
      profit_potential: 42000,
      equity_percent: 28,
      days_since_added: 4,
      urgency_reason: null,
      deal_score_rank: "",
      arv: 198000,
    },
  ];

  // Use demo data if no real data exists
  const hasRealData = pipelineValueStatsRaw && (
    pipelineValueStatsRaw.leads.count > 0 ||
    pipelineValueStatsRaw.offers.count > 0 ||
    pipelineValueStatsRaw.contracted.count > 0 ||
    pipelineValueStatsRaw.sold.count > 0
  );
  
  const pipelineValueStats = hasRealData ? pipelineValueStatsRaw : demoData;
  
  // Use demo hot opportunities if no real data
  const hasRealHotOpportunities = hotOpportunities && hotOpportunities.length > 0;
  const displayHotOpportunities = hasRealHotOpportunities 
    ? (insights?.hotOpportunities || hotOpportunities) 
    : demoHotOpportunities;

  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleCall = (e: React.MouseEvent, phone: string | null) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmail = (e: React.MouseEvent, email: string | null) => {
    e.stopPropagation();
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const totalPipeline = pipelineStats?.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <AppLayout>
      {/* Greeting Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-small text-muted-foreground font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="text-h1 font-bold text-foreground mt-1">
            Welcome Back 👋
          </h1>
        </div>
        <GoalSettingsDialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Target className="h-4 w-4" />
            Goal Settings
          </Button>
        </GoalSettingsDialog>
      </div>

      {/* Daily Focus - Decision Engine */}
      <DailyFocus />

      {/* Pipeline Value Cards - Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PipelineValueCard
          title="Leads"
          subtitle="New Opportunities"
          count={pipelineValueStats?.leads.count || 0}
          totalValue={pipelineValueStats?.leads.totalValue || 0}
          profitPotential={pipelineValueStats?.leads.profitPotential || 0}
          icon={Users}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/properties?status=new,contacted,appointment")}
          goal={goals.leadsGoal}
          actionInsight={insights?.leadsInsight}
        />
        <PipelineValueCard
          title="Offers"
          subtitle="Active Proposals"
          count={pipelineValueStats?.offers.count || 0}
          totalValue={pipelineValueStats?.offers.totalValue || 0}
          profitPotential={pipelineValueStats?.offers.profitPotential || 0}
          icon={FileText}
          iconBg="bg-amber-100"
          iconColor="text-amber-500"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/properties?status=offer_made,negotiating")}
          goal={goals.offersGoal}
          contextLine={pipelineValueStats?.offers.count && pipelineValueStats.offers.count > 0 
            ? `${pipelineValueStats.offers.count} ${pipelineValueStats.offers.count === 1 ? "Offer" : "Offers"} Awaiting Response` 
            : undefined}
          contextIcon={Hourglass}
          contextSeverity="attention"
        />
        <PipelineValueCard
          title="Contracts"
          subtitle="Locked Deals"
          count={pipelineValueStats?.contracted.count || 0}
          totalValue={pipelineValueStats?.contracted.totalValue || 0}
          profitPotential={pipelineValueStats?.contracted.profitPotential || 0}
          icon={Handshake}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          valueLabel="Revenue Secured"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/pipeline?filter=under_contract")}
          goal={goals.contractsGoal}
          variant="calm"
          nextExpectedClose={pipelineValueStats?.contracted.count && pipelineValueStats.contracted.count > 0 ? 14 : undefined}
        />
        <PipelineValueCard
          title="Sold"
          subtitle="Closed Deals"
          count={pipelineValueStats?.sold.count || 0}
          totalValue={pipelineValueStats?.sold.totalValue || 0}
          profitPotential={pipelineValueStats?.sold.profitPotential || 0}
          icon={BadgeDollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-500"
          profitLabel="Realized Profit"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/properties?status=closed")}
          goal={goals.soldGoal}
          variant="celebration"
          lastClosedDaysAgo={pipelineValueStats?.sold.count && pipelineValueStats.sold.count > 0 ? 3 : undefined}
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hot Opportunities */}
        <Card variant="default" padding="none" className="overflow-hidden">
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
          <div className="max-h-[400px] overflow-y-auto">
            {hotLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
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
              <div className="p-2">
                {/* Use demo data if no real opportunities, otherwise use enhanced from insights */}
                {displayHotOpportunities?.slice(0, 5).map((opp) => {
                  // Check if it's an enhanced opportunity with urgency_reason
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
                    <HotOpportunityItem
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
          </div>
        </Card>

        {/* Pipeline Overview */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <h2 className="text-body font-semibold text-foreground">Pipeline Overview</h2>
            <span className="text-small font-medium px-2.5 py-1 rounded-full bg-background-secondary text-muted-foreground tabular-nums">
              {totalPipeline} total
            </span>
          </div>
          {pipelineLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {pipelineStats?.map((stage, index) => (
                <PipelineStage
                  key={stage.status}
                  stage={stage}
                  total={totalPipeline}
                  previousCount={index > 0 ? pipelineStats[index - 1].count : stage.count}
                  onClick={() => navigate(`/pipeline?filter=${stage.status}`)}
                />
              ))}
            </div>
          )}
          {/* Visual Bar */}
          {!pipelineLoading && totalPipeline > 0 && (
            <div className="px-4 pb-4">
              <div className="flex h-2.5 rounded-full overflow-hidden bg-background-tertiary shadow-inner">
                {pipelineStats?.map((stage) => (
                  <div
                    key={stage.status}
                    className={cn("transition-all duration-500", stage.color)}
                    style={{ width: `${(stage.count / totalPipeline) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>


      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-accent/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
              <h2 className="text-body font-semibold text-foreground">Today's Tasks</h2>
            </div>
            <span className="text-small font-medium px-2.5 py-1 rounded-full bg-background-secondary text-muted-foreground tabular-nums">
              {todaysTasks?.filter(t => !completedTasks.has(t.id) && !t.completed).length || 0} remaining
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {tasksLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : todaysTasks?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">All caught up!</p>
                <p className="text-tiny mt-1">No tasks for today</p>
              </div>
            ) : (
              <div className="p-2">
                {todaysTasks?.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={{
                      ...task,
                      completed: task.completed || completedTasks.has(task.id),
                    }}
                    onToggle={handleTaskToggle}
                    onClick={() => navigate(`/properties/${task.propertyId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-body font-semibold text-foreground">Recent Activity</h2>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {activityLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No activity yet</p>
                <p className="text-tiny mt-1">Start adding properties to see activity</p>
              </div>
            ) : (
              <div className="p-2">
                {recentActivity?.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => activity.propertyId && navigate(`/properties/${activity.propertyId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

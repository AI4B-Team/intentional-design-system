import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export interface ActionInsight {
  label: string;
  severity?: "low" | "medium" | "high";
}

export interface PipelineValueCardProps {
  title: string;
  subtitle?: string;
  count: number;
  totalValue: number;
  profitPotential: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  profitLabel?: string;
  valueLabel?: string;
  isLoading?: boolean;
  onClick?: () => void;
  goal?: number;
  actionInsight?: ActionInsight | null;
  variant?: "default" | "calm" | "celebration";
  nextExpectedClose?: number;
  lastClosedDaysAgo?: number;
  contextLine?: string;
  contextIcon?: React.ElementType;
  contextSeverity?: "reminder" | "attention" | "blocking";
}

export function PipelineValueCard({ 
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
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        isCalmVariant 
          ? "bg-gradient-to-br from-transparent via-transparent to-success/5" 
          : "bg-gradient-to-br from-transparent via-transparent to-primary/5"
      )} />
      
      <div className="relative flex flex-col h-full">
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
                  // At 0%, always show red regardless of variant
                  goalProgress === 0 
                    ? "text-destructive"
                    : isCalmVariant 
                      ? "text-success" 
                      : goalProgress >= 75 ? "text-success" : goalProgress >= 40 ? "text-warning" : "text-destructive"
                )}>
                  {goalProgress}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
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

        <div className="flex-1 mt-3 flex items-center justify-center">
          {contextLine && (
            <div className={cn(
              "inline-flex items-center gap-1.5 text-tiny px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap",
              contextSeverity === "blocking" 
                ? "bg-destructive/10 text-destructive" 
                : contextSeverity === "attention"
                ? "bg-warning/10 text-warning"
                : "bg-info/10 text-info"
            )}>
              {ContextIcon && <ContextIcon className="h-3.5 w-3.5 shrink-0" />}
              <span>{contextLine}</span>
            </div>
          )}

          {nextExpectedClose !== undefined && nextExpectedClose > 0 && (
            <div className="inline-flex items-center gap-1.5 text-tiny px-2.5 py-1.5 rounded-md font-medium bg-muted text-muted-foreground whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Next Expected Close: {nextExpectedClose} {nextExpectedClose === 1 ? "Day" : "Days"}</span>
            </div>
          )}

          {variant === "celebration" && goalGap > 0 && (
            <div className="inline-flex items-center gap-1.5 text-tiny px-2.5 py-1.5 rounded-md font-medium bg-muted text-muted-foreground whitespace-nowrap">
              <BarChart3 className="h-3.5 w-3.5 shrink-0" />
              <span>{goalGap} {goalGap === 1 ? "Deal" : "Deals"} Needed To Hit Goal</span>
            </div>
          )}

          {actionInsight && variant === "default" && (
            <div className={cn(
              "inline-flex items-center gap-1.5 text-tiny px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap",
              actionInsight.severity === "high" 
                ? "bg-warning/10 text-warning"
                : actionInsight.severity === "medium"
                ? "bg-warning/10 text-warning"
                : "bg-info/10 text-info"
            )}>
              {actionInsight.severity === "high" && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
              {actionInsight.severity === "medium" && <Clock className="h-3.5 w-3.5 shrink-0" />}
              {actionInsight.severity === "low" && <Clock className="h-3.5 w-3.5 shrink-0" />}
              <span>{actionInsight.label}</span>
            </div>
          )}
        </div>

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

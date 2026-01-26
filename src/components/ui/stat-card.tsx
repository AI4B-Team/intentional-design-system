import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  href,
  className,
}: StatCardProps) {
  // Support both 'change' and 'trend' props for backwards compatibility
  const trendData = change || (trend ? { value: trend.value, trend: trend.value >= 0 ? "up" as const : "down" as const } : undefined);
  const trendLabel = trend?.label;

  const content = (
    <Card
      variant={href ? "interactive" : "default"}
      padding="md"
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-small text-content-secondary uppercase tracking-wide font-medium">
            {label}
          </p>
          <p className="text-h1 font-semibold text-content tabular-nums">
            {value}
          </p>
          {trendData && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-small font-medium",
                trendData.trend === "up" || trendData.value >= 0
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {trendData.trend === "up" || trendData.value >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {trendData.value > 0 ? "+" : ""}
                {trendData.value}%
              </span>
              {trendLabel && (
                <span className="text-content-tertiary font-normal">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-medium bg-surface-tertiary text-content-tertiary [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

// Clickable variant
interface ClickableStatCardProps extends StatCardProps {
  onClick?: () => void;
}

export function ClickableStatCard({
  onClick,
  className,
  ...props
}: ClickableStatCardProps) {
  return (
    <button onClick={onClick} className={cn("w-full text-left", className)}>
      <StatCard {...props} />
    </button>
  );
}

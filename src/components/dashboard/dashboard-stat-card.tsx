import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DashboardStatCard({
  label,
  value,
  trend,
  icon,
  iconBgClass,
  iconColorClass,
  className,
  style,
}: DashboardStatCardProps) {
  return (
    <Card
      variant="default"
      padding="md"
      className={cn(
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
        className
      )}
      style={style}
    >
      {/* Top Row: Icon + Trend */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            iconBgClass
          )}
        >
          <div className={cn("[&>svg]:h-5 [&>svg]:w-5", iconColorClass)}>
            {icon}
          </div>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium",
            trend.isPositive
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="text-display font-semibold text-content tabular-nums mb-1">
        {value}
      </div>

      {/* Label */}
      <div className="text-small text-content-secondary uppercase tracking-wide">
        {label}
      </div>
    </Card>
  );
}

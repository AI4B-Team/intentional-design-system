import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-success";
    if (trend.value < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-md">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-tiny font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="stat-number text-foreground">{value}</p>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-small font-medium",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span>
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
                {trend.label && (
                  <span className="text-muted-foreground font-normal">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background-tertiary text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
    <button
      onClick={onClick}
      className={cn("w-full text-left", className)}
    >
      <StatCard {...props} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" />
    </button>
  );
}

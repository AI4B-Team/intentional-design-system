import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { calculateVelocityScore, type PropertyVelocityData } from "@/lib/velocity-scoring";
import { cn } from "@/lib/utils";

interface VelocityBadgeProps {
  velocityData: PropertyVelocityData;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function VelocityBadge({
  velocityData,
  showLabel = false,
  size = "sm",
  className,
}: VelocityBadgeProps) {
  const result = React.useMemo(() => calculateVelocityScore(velocityData), [velocityData]);

  const variant =
    result.urgency_level === "CRITICAL"
      ? "error"
      : result.urgency_level === "HIGH"
      ? "warning"
      : result.urgency_level === "STANDARD"
      ? "info"
      : "secondary";

  return (
    <Badge variant={variant} size={size} className={cn("gap-1", className)}>
      <Zap className={cn("h-3 w-3", size === "md" && "h-3.5 w-3.5")} />
      <span>{result.score}</span>
      {showLabel && <span className="ml-0.5">{result.urgency_level}</span>}
    </Badge>
  );
}

export function VelocityScoreCell({
  velocityData,
}: {
  velocityData: PropertyVelocityData;
}) {
  const result = React.useMemo(() => calculateVelocityScore(velocityData), [velocityData]);

  const colorClass =
    result.urgency_level === "CRITICAL"
      ? "text-destructive"
      : result.urgency_level === "HIGH"
      ? "text-warning"
      : result.urgency_level === "STANDARD"
      ? "text-info"
      : "text-muted-foreground";

  return (
    <div className="flex items-center gap-1.5">
      <Zap className={cn("h-3.5 w-3.5", colorClass)} />
      <span className={cn("font-semibold tabular-nums", colorClass)}>{result.score}</span>
    </div>
  );
}

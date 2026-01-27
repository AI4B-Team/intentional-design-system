import * as React from "react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/motivationiq";
import { Flame, Thermometer, Snowflake, Wind, Sun } from "lucide-react";

interface MotivationIQBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreIcon(score: number) {
  if (score >= 800) return Flame;
  if (score >= 600) return Sun;
  if (score >= 400) return Thermometer;
  if (score >= 200) return Wind;
  return Snowflake;
}

export function MotivationIQBadge({
  score,
  showLabel = true,
  size = "md",
  className,
}: MotivationIQBadgeProps) {
  const tier = getScoreTier(score);
  const Icon = getScoreIcon(score);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-tiny gap-1",
    md: "px-2.5 py-1 text-small gap-1.5",
    lg: "px-3 py-1.5 text-body gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        tier.bgColor,
        tier.color,
        tier.borderColor,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span className="tabular-nums">{score}</span>
      {showLabel && (
        <>
          <span className="mx-0.5 opacity-50">·</span>
          <span className="font-medium">{tier.label}</span>
        </>
      )}
    </div>
  );
}

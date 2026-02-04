import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        error: "bg-destructive/10 text-destructive",
        destructive: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
        outline: "border border-border text-foreground-secondary",
        // Heat Score Variants
        hot: "bg-score-hot/10 text-score-hot",
        warm: "bg-score-warm/10 text-score-warm",
        moderate: "bg-score-moderate/10 text-score-moderate",
        cool: "bg-score-cool/10 text-score-cool",
        cold: "bg-score-cold/10 text-score-cold",
      },
      size: {
        sm: "px-2 py-0.5 text-tiny",
        md: "px-2.5 py-1 text-small",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Heat Score Badge Helper
type HeatLevel = "hot" | "warm" | "moderate" | "cool" | "cold";

function getHeatLevel(score: number): HeatLevel {
  if (score >= 800) return "hot";
  if (score >= 600) return "warm";
  if (score >= 400) return "moderate";
  if (score >= 200) return "cool";
  return "cold";
}

function getHeatLabel(level: HeatLevel): string {
  const labels: Record<HeatLevel, string> = {
    hot: "Hot",
    warm: "Warm",
    moderate: "Moderate",
    cool: "Cool",
    cold: "Cold",
  };
  return labels[level];
}

interface HeatScoreBadgeProps extends Omit<BadgeProps, "variant"> {
  score: number;
  showScore?: boolean;
}

function HeatScoreBadge({
  score,
  showScore = true,
  className,
  size,
  ...props
}: HeatScoreBadgeProps) {
  const level = getHeatLevel(score);
  const label = getHeatLabel(level);

  return (
    <Badge variant={level} size={size} className={className} {...props}>
      {showScore ? `${label} (${score})` : label}
    </Badge>
  );
}

export { Badge, badgeVariants, HeatScoreBadge, getHeatLevel, getHeatLabel };

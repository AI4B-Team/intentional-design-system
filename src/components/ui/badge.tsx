import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md font-semibold transition-colors ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary/8 text-primary ring-primary/20",
        secondary: "bg-muted text-muted-foreground ring-border",
        success: "bg-success/8 text-success ring-success/20",
        warning: "bg-warning/8 text-warning ring-warning/20",
        error: "bg-destructive/8 text-destructive ring-destructive/20",
        destructive: "bg-destructive/8 text-destructive ring-destructive/20",
        info: "bg-info/8 text-info ring-info/20",
        outline: "bg-transparent border border-border text-foreground-secondary ring-0",
        // Heat Score Variants
        hot: "bg-score-hot/10 text-score-hot ring-score-hot/20",
        warm: "bg-score-warm/10 text-score-warm ring-score-warm/20",
        moderate: "bg-score-moderate/10 text-score-moderate ring-score-moderate/20",
        cool: "bg-score-cool/10 text-score-cool ring-score-cool/20",
        cold: "bg-score-cold/10 text-score-cold ring-score-cold/20",
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
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "error" && "bg-destructive",
            variant === "destructive" && "bg-destructive",
            variant === "default" && "bg-primary",
            variant === "info" && "bg-info",
            (!variant || !["success", "warning", "error", "destructive", "info"].includes(variant)) && variant === "default" && "bg-primary"
          )}
        />
      )}
      {children}
    </div>
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

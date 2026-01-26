import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-tiny font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-muted text-muted-foreground",
        success: "bg-success-muted text-success",
        warning: "bg-warning-muted text-warning",
        destructive: "bg-destructive-muted text-destructive",
        info: "bg-info-muted text-info",
        outline: "border border-border text-foreground-secondary",
        // Heat Score Variants
        hot: "bg-heat-hot/10 text-heat-hot",
        warm: "bg-heat-warm/10 text-heat-warm",
        moderate: "bg-heat-moderate/10 text-heat-moderate",
        cool: "bg-heat-cool/10 text-heat-cool",
        cold: "bg-heat-cold/10 text-heat-cold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
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
  ...props
}: HeatScoreBadgeProps) {
  const level = getHeatLevel(score);
  const label = getHeatLabel(level);

  return (
    <Badge variant={level} className={className} {...props}>
      {showScore ? `${label} (${score})` : label}
    </Badge>
  );
}

export { Badge, badgeVariants, HeatScoreBadge, getHeatLevel, getHeatLabel };

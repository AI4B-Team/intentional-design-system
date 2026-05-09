import { cn } from "@/lib/utils";
import { tierFromScore, type ScoreTier } from "@/types/harvest";

const TIER_STYLES: Record<ScoreTier, { bg: string; text: string; ring: string; label: string }> = {
  hot: { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/30", label: "Hot" },
  warm: { bg: "bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30", label: "Warm" },
  watch: { bg: "bg-yellow-500/15", text: "text-yellow-700 dark:text-yellow-400", ring: "ring-yellow-500/30", label: "Watch" },
  archive: { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border", label: "Archive" },
};

interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({ score, showLabel = true, className }: ScoreBadgeProps) {
  const tier = tierFromScore(score);
  const s = TIER_STYLES[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset",
        s.bg,
        s.text,
        s.ring,
        className,
      )}
    >
      {showLabel && <span>{s.label}</span>}
      <span>{score}</span>
    </span>
  );
}

export function tierLabel(tier: ScoreTier) {
  return TIER_STYLES[tier].label;
}

import { cn } from "@/lib/utils";
import { SIGNAL_LABELS, type SignalType } from "@/types/harvest";

interface SignalPillProps {
  type: SignalType;
  count?: number;
  className?: string;
}

export function SignalPill({ type, count, className }: SignalPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted",
        className,
      )}
    >
      <span>{SIGNAL_LABELS[type]}</span>
      {typeof count === "number" && (
        <span className="tabular-nums text-foreground/80">
          {count.toLocaleString()}
        </span>
      )}
    </span>
  );
}

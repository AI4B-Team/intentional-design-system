import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

/**
 * Small, unobtrusive indicator that a widget or page is currently rendering
 * illustrative sample data because the org has no real records yet.
 * Never use this to label real data.
 */
export function SampleDataBadge({
  className,
  compact = false,
  title = "This widget is showing illustrative sample data because your organization has no records here yet.",
}: {
  className?: string;
  compact?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title}
      aria-label="Sample data"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 text-muted-foreground",
        compact
          ? "px-1.5 py-px text-[10px] font-medium uppercase tracking-wide"
          : "px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        className,
      )}
    >
      <Info className="h-3 w-3" />
      Sample data
    </span>
  );
}

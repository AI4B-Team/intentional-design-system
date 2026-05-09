import * as React from "react";
import { cn } from "@/lib/utils";
import { Activity, X } from "lucide-react";

interface LiveFeedTickerProps {
  items: string[];
  className?: string;
}

export function LiveFeedTicker({ items, className }: LiveFeedTickerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (dismissed || items.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [dismissed, items.length]);

  if (dismissed || items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="flex-1 text-foreground/80 truncate">{items[idx]}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded p-0.5 text-muted-foreground hover:bg-muted"
        aria-label="Dismiss live feed"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

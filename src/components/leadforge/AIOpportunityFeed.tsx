import * as React from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SEED = [
  { tag: "DETECTED", text: "Vacant property — utility shutoff confirmed", meta: "Dallas, TX · 8s ago", tone: "cyan" },
  { tag: "ENRICHED", text: "Owner inherited property 41 days ago", meta: "Probate match · 22s ago", tone: "violet" },
  { tag: "VERIFIED", text: "Phone number verified for high-equity owner", meta: "Tampa, FL · 47s ago", tone: "emerald" },
  { tag: "ENGAGED", text: "Seller clicked SMS link — opened twice", meta: "Houston, TX · 1m ago", tone: "amber" },
  { tag: "QUALIFIED", text: "Campaign converted lead to qualified seller", meta: "Atlanta, GA · 2m ago", tone: "primary" },
  { tag: "ESCALATED", text: "AI handoff to human rep — high motivation", meta: "Phoenix, AZ · 3m ago", tone: "rose" },
  { tag: "DETECTED", text: "Code violation filing on absentee-owned home", meta: "Memphis, TN · 4m ago", tone: "cyan" },
  { tag: "ENRICHED", text: "Tax delinquency match · 3rd year in arrears", meta: "Birmingham, AL · 5m ago", tone: "violet" },
];

const TONE: Record<string, string> = {
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export function AIOpportunityFeed() {
  const [items, setItems] = React.useState(SEED);

  React.useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => {
        const next = SEED[Math.floor(Math.random() * SEED.length)];
        return [{ ...next, meta: next.meta.replace(/\d+[ms]?\s?ago/, "just now") }, ...prev].slice(0, 9);
      });
    }, 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Opportunity Feed
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Streaming
        </div>
      </div>
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1" style={{ scrollbarGutter: "stable" }}>
        {items.map((it, i) => (
          <div
            key={`${it.text}-${i}`}
            className={cn(
              "flex items-start gap-2.5 py-2 px-2.5 rounded-md border border-transparent hover:border-border hover:bg-muted/40 transition-colors",
              i === 0 && "animate-fade-in"
            )}
          >
            <span
              className={cn(
                "shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border tabular-nums",
                TONE[it.tone]
              )}
            >
              {it.tag}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{it.text}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{it.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

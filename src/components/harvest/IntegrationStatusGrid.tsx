import { cn } from "@/lib/utils";
import { Search, Mail, Send, Check } from "lucide-react";
import type { HarvestIntegration } from "@/types/harvest";

const ICONS = { Enrich: Search, Mail: Mail, Sync: Send } as const;

const STATUS_STYLES: Record<HarvestIntegration["status"], { label: string; className: string }> = {
  connected: { label: "Connected", className: "text-emerald-600 dark:text-emerald-400" },
  active: { label: "Active", className: "text-emerald-600 dark:text-emerald-400" },
  test: { label: "Test Mode", className: "text-yellow-600 dark:text-yellow-400" },
  disconnected: { label: "Disconnected", className: "text-muted-foreground" },
};

interface IntegrationStatusGridProps {
  integrations: HarvestIntegration[];
  className?: string;
}

export function IntegrationStatusGrid({ integrations, className }: IntegrationStatusGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3", className)}>
      {integrations.map((it) => {
        const Icon = ICONS[it.name];
        const s = STATUS_STYLES[it.status];
        return (
          <div
            key={it.name}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4 text-foreground/80" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm text-foreground">{it.name}</div>
                <div className={cn("flex items-center gap-1 text-xs font-medium", s.className)}>
                  <Check className="h-3 w-3" />
                  {s.label}
                </div>
              </div>
              <div className="text-xs text-muted-foreground truncate">{it.description}</div>
              {it.lastRun && (
                <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                  Last run: {it.lastRun}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

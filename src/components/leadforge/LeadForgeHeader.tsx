import * as React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeadForgeHeader() {
  return (
    <div className="px-6 pt-6 pb-4 bg-background">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">
              Automated Leads
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            Autonomous deal-finding system. Scanning, scoring, and engaging sellers in the background.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

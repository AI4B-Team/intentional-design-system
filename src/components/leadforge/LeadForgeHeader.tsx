import * as React from "react";
import { Zap, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeadForgeHeader() {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-border bg-background">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">
              Automated Lead Machine
            </h1>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5 font-medium">
              <span className="text-primary">RE Reset</span> · Distress Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground text-[11px] font-medium border border-border">
            <RefreshCw className="h-3 w-3" />
            Updated Every 2 Hours
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

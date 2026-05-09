import * as React from "react";
import { Search, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

export function LeadForgeHeader() {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-border bg-background">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-sm">
            <Zap className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">Leads</h1>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5 font-medium">
              <span className="text-primary">RE Reset</span> · Distress Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xl min-w-[260px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search address, owner, ZIP…"
              className="pl-9 h-10 bg-muted/40 border-border"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
}

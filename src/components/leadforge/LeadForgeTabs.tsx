import * as React from "react";
import { Sparkles, Target, Send, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export type MainTab = "today" | "prospects" | "actions" | "system";

const TABS: { value: MainTab; label: string; icon: React.ElementType }[] = [
  { value: "today", label: "Today", icon: Sparkles },
  { value: "prospects", label: "Prospects", icon: Target },
  { value: "actions", label: "Actions", icon: Send },
];

export function LeadForgeTabs({
  value,
  onChange,
}: {
  value: MainTab;
  onChange: (v: MainTab) => void;
}) {
  return (
    <div className="px-6 border-b border-border bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {TABS.map((t) => {
            const active = value === t.value;
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => onChange(t.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onChange("system")}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
            value === "system"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          System
        </button>
      </div>
    </div>
  );
}

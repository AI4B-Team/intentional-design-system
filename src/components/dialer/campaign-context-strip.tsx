import * as React from "react";
import { cn } from "@/lib/utils";
import { Megaphone, Target, ListFilter, Globe } from "lucide-react";

interface CampaignContext {
  campaignName?: string;
  listName?: string;
  objective?: string;
  source?: string;
}

interface CampaignContextStripProps {
  context: CampaignContext;
  className?: string;
}

export function CampaignContextStrip({ context, className }: CampaignContextStripProps) {
  if (!context.campaignName && !context.listName && !context.objective && !context.source) return null;

  const items = [
    { icon: Megaphone, label: "Campaign", value: context.campaignName, color: "text-amber-600" },
    { icon: ListFilter, label: "List", value: context.listName, color: "text-blue-600" },
    { icon: Target, label: "Objective", value: context.objective, color: "text-emerald-600" },
    { icon: Globe, label: "Source", value: context.source, color: "text-violet-600" },
  ].filter(item => item.value);

  return (
    <div className={cn("flex items-center gap-3 flex-wrap text-[11px]", className)}>
      {items.map(({ icon: Icon, label, value, color }) => (
        <span key={label} className="inline-flex items-center gap-1 text-muted-foreground">
          <Icon className={cn("h-3 w-3", color)} />
          <span className="font-medium">{label}:</span>
          <span className="font-semibold text-foreground">{value}</span>
        </span>
      ))}
    </div>
  );
}

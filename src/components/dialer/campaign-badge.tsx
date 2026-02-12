import * as React from "react";
import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";

interface CampaignBadgeProps {
  campaignName?: string;
  className?: string;
}

export function CampaignBadge({ campaignName, className }: CampaignBadgeProps) {
  if (!campaignName) return null;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20",
      className
    )}>
      <Megaphone className="h-2.5 w-2.5" />
      {campaignName}
    </span>
  );
}

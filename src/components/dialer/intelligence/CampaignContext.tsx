import * as React from "react";
import { cn } from "@/lib/utils";
import { Megaphone, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CampaignContextProps {
  campaignName?: string;
  conversionRate?: number;
  lastTouch?: string;
  contactsRemaining?: number;
}

export function CampaignContext({
  campaignName = "Q1 Tampa Absentee Sellers",
  conversionRate = 18,
  lastTouch = "2 days ago",
  contactsRemaining = 23,
}: CampaignContextProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning/10 text-warning border border-warning/20">
          <Megaphone className="h-3 w-3" />
          {campaignName}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-md bg-muted/30">
          <div className="text-[10px] text-muted-foreground">Convert</div>
          <div className="text-sm font-bold text-foreground">{conversionRate}%</div>
        </div>
        <div className="text-center p-2 rounded-md bg-muted/30">
          <div className="text-[10px] text-muted-foreground">Last Touch</div>
          <div className="text-xs font-semibold text-foreground">{lastTouch}</div>
        </div>
        <div className="text-center p-2 rounded-md bg-muted/30">
          <div className="text-[10px] text-muted-foreground">Remaining</div>
          <div className="text-sm font-bold text-foreground">{contactsRemaining}</div>
        </div>
      </div>
      <button
        onClick={() => navigate("/campaigns")}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
      >
        View Campaign <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}

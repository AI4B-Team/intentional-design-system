import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workflow, Phone, MessageSquare, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { InPipelineBadge } from "./InPipelineBadge";

export interface AcquisitionLead {
  id: string;
  addr: string;
  city: string;
  owner: string;
  score: number;
  confidence: number;
  badges: string[];
  summary: string;
  campaign: string;
  nextAction: { icon: "phone" | "sms" | "mail"; label: string };
  image?: string;
}

const ACTION_ICON = { phone: Phone, sms: MessageSquare, mail: Mail };

export function AcquisitionLeadCard({
  lead,
  graduated,
  onPipeline,
}: {
  lead: AcquisitionLead;
  graduated: boolean;
  onPipeline: () => void;
}) {
  const NbaIcon = ACTION_ICON[lead.nextAction.icon];
  const scoreTone =
    lead.score >= 85
      ? "from-rose-500 to-rose-600"
      : lead.score >= 75
      ? "from-amber-500 to-orange-500"
      : "from-primary to-primary/80";

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-[0_4px_18px_-6px_hsl(var(--primary)/0.25)] transition-all overflow-hidden",
        graduated && "opacity-70"
      )}
    >
      <div className="flex gap-3 p-3">
        {/* Property thumb */}
        <div className="relative h-20 w-24 shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-muted via-muted/60 to-muted-foreground/10 border border-border">
          {lead.image ? (
            <img
              src={lead.image}
              alt={lead.addr}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Property
            </div>
          )}
          <div
            className={cn(
              "absolute top-1 left-1 h-7 w-7 rounded-md text-white text-[11px] font-bold flex items-center justify-center bg-gradient-to-br tabular-nums shadow-md",
              scoreTone
            )}
          >
            {lead.score}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{lead.addr}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {lead.city} · {lead.owner}
              </p>
            </div>
            {graduated ? (
              <InPipelineBadge />
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 gap-1 text-primary hover:text-primary shrink-0"
                onClick={onPipeline}
              >
                <Workflow className="h-3.5 w-3.5" />
                Pipeline
              </Button>
            )}
          </div>

          {/* Distress badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {lead.badges.slice(0, 4).map((b) => (
              <Badge
                key={b}
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-medium border-border/70 bg-muted/40 text-foreground/80"
              >
                {b}
              </Badge>
            ))}
          </div>

          {/* AI summary */}
          <p className="text-[11px] text-muted-foreground leading-snug mt-2 line-clamp-2">
            <Sparkles className="h-3 w-3 inline-block mr-1 -mt-0.5 text-primary" />
            {lead.summary}
          </p>
        </div>
      </div>

      {/* Footer rail */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/20 text-[10px]">
        <div className="px-2.5 py-1.5 min-w-0">
          <div className="uppercase tracking-wider text-muted-foreground font-semibold">Confidence</div>
          <div className="flex items-center gap-1 mt-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-bold tabular-nums text-foreground">{lead.confidence}%</span>
          </div>
        </div>
        <div className="px-2.5 py-1.5 min-w-0">
          <div className="uppercase tracking-wider text-muted-foreground font-semibold">Campaign</div>
          <div className="text-xs font-medium text-foreground truncate mt-0.5">{lead.campaign}</div>
        </div>
        <div className="px-2.5 py-1.5 min-w-0">
          <div className="uppercase tracking-wider text-muted-foreground font-semibold">Next Best</div>
          <div className="flex items-center gap-1 mt-0.5">
            <NbaIcon className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-foreground truncate">{lead.nextAction.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

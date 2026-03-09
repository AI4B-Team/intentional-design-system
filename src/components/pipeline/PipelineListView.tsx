import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Kanban,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Bed,
  Bath,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineDeal } from "@/hooks/usePipelineDeals";
import type { PipelineStageConfig } from "./pipeline-config";

interface PipelineListViewProps {
  deals: PipelineDeal[];
  stages: PipelineStageConfig[];
  onViewDeal: (deal: PipelineDeal) => void;
  onAddDeal: (stageId: string) => void;
}

export function PipelineListView({ deals, stages, onViewDeal, onAddDeal }: PipelineListViewProps) {
  const formatPhoneForTel = (phone?: string) => {
    if (!phone) return "";
    const digits = phone.replace(/[^\d+]/g, "");
    return digits.startsWith("+") ? digits : `+1${digits}`;
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-surface-secondary shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Property</th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Type</th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Stage</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Beds/Baths</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Sq Ft</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Price</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">ARV</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Score</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Days</th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Contact</th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <EmptyState
                    icon={<Kanban className="h-9 w-9 text-muted-foreground opacity-70" />}
                    title="Your pipeline is empty"
                    description="Add your first deal to start tracking it through your acquisition process."
                    action={{ label: "Add Deal", onClick: () => onAddDeal("new") }}
                  />
                </td>
              </tr>
            ) : (
              deals.map((deal, index) => {
                const stageConfig = stages.find(s => s.id === deal.stage);
                const homeTypeLabel = deal.property_type
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase()) || "—";

                return (
                  <tr
                    key={deal.id}
                    onClick={() => onViewDeal(deal)}
                    className={cn(
                      "h-14 cursor-pointer transition-colors group",
                      index % 2 === 0 ? "bg-card" : "bg-surface-secondary/50",
                      "hover:bg-brand-accent/5"
                    )}
                  >
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-body font-medium text-content group-hover:text-brand-accent transition-colors whitespace-nowrap">
                            {deal.address}
                          </div>
                          <div className="flex items-center gap-1 text-small text-content-secondary whitespace-nowrap">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {deal.city}, {deal.state} {deal.zip}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success border border-success/20">
                        {homeTypeLabel}
                      </span>
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <Badge className={cn("text-white text-[10px]", stageConfig?.color)}>
                        {stageConfig?.label}
                      </Badge>
                    </td>
                    <td className="px-4 text-center text-body tabular-nums">
                      <span className="flex items-center justify-center gap-2 text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{deal.beds}</span>
                        <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{deal.baths}</span>
                      </span>
                    </td>
                    <td className="px-4 text-center text-body tabular-nums">
                      {deal.sqft?.toLocaleString() || "—"}
                    </td>
                    <td className="px-4 text-center">
                      <span className="text-body font-bold text-success tabular-nums">
                        ${deal.asking_price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 text-center text-body tabular-nums text-muted-foreground">
                      ${deal.arv.toLocaleString()}
                    </td>
                    <td className="px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-small font-medium",
                        deal.lead_score >= 80 ? "bg-success/10 text-success" :
                        deal.lead_score >= 60 ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      )}>
                        {deal.lead_score}
                      </span>
                    </td>
                    <td className="px-4 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                        deal.days_in_stage >= 3
                          ? "bg-destructive/15 text-destructive"
                          : deal.days_in_stage >= 2
                            ? "bg-warning/15 text-warning"
                            : "bg-muted text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3" />
                        {deal.days_in_stage === 0 ? "Today" : `${deal.days_in_stage}D`}
                      </div>
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <div className="text-body font-medium">{deal.contact_name}</div>
                      <div className="text-tiny text-content-secondary">{deal.contact_type}</div>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center justify-center gap-0.5">
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                                e.stopPropagation();
                                if (deal.contact_phone) window.open(`tel:${formatPhoneForTel(deal.contact_phone)}`);
                              }}>
                                <Phone className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{deal.contact_phone ? `Call ${deal.contact_phone}` : "No Phone"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                                e.stopPropagation();
                                if (deal.contact_phone) window.open(`sms:${formatPhoneForTel(deal.contact_phone)}`);
                              }}>
                                <MessageCircle className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{deal.contact_phone ? "Text Seller" : "No Phone"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                                e.stopPropagation();
                                if (deal.contact_email) window.open(`mailto:${deal.contact_email}`);
                              }}>
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{deal.contact_email ? `Email ${deal.contact_email}` : "No Email"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  Home,
  Bed,
  Bath,
  Ruler,
  Target,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { PipelineDeal } from "@/hooks/usePipelineDeals";
import { PIPELINE_STAGES, getLeadScoreBg, getLeadScoreColor } from "./pipeline-config";

interface DealDetailModalProps {
  deal: PipelineDeal | null;
  onClose: () => void;
}

export function DealDetailModal({ deal, onClose }: DealDetailModalProps) {
  const navigate = useNavigate();

  if (!deal) return null;

  return (
    <Dialog open={!!deal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto top-[8%] translate-y-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand" />
            {deal.address}
          </DialogTitle>
          <DialogDescription>
            {deal.city}, {deal.state} {deal.zip}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <Badge className={cn("text-white", PIPELINE_STAGES.find(s => s.id === deal.stage)?.color)}>
              {PIPELINE_STAGES.find(s => s.id === deal.stage)?.label}
            </Badge>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-small font-medium",
              getLeadScoreBg(deal.lead_score),
              getLeadScoreColor(deal.lead_score)
            )}>
              <Target className="h-4 w-4" />
              Lead Score: {deal.lead_score}
            </div>
          </div>

          <Card className="p-3">
            <h4 className="text-small font-semibold mb-2">Deal Numbers</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-tiny text-content-tertiary">Asking Price</p>
                <p className="text-lg font-bold">${deal.asking_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-tiny text-content-tertiary">ARV</p>
                <p className="text-lg font-bold">${deal.arv.toLocaleString()}</p>
              </div>
              {deal.offer_amount && (
                <div>
                  <p className="text-tiny text-content-tertiary">Our Offer</p>
                  <p className="text-lg font-bold text-success">${deal.offer_amount.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-tiny text-content-tertiary">Equity</p>
                <p className={cn("text-lg font-bold", deal.equity_percentage >= 20 ? "text-success" : "")}>
                  {deal.equity_percentage}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <h4 className="text-small font-semibold mb-2">Property Details</h4>
            <div className="flex items-center gap-4 text-small text-muted-foreground">
              <span className="flex items-center gap-1.5"><Home className="h-4 w-4" />{deal.property_type}</span>
              <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{deal.beds} bed</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{deal.baths} bath</span>
              <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4" />{deal.sqft.toLocaleString()} sqft</span>
            </div>
          </Card>

          <Card className="p-3">
            <h4 className="text-small font-semibold mb-2">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{deal.contact_name}</p>
                  <Badge variant="secondary" size="sm" className="rounded-md uppercase">{deal.contact_type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="sm"><Phone className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Call {deal.contact_phone || "(512) 555-0147"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        const phone = deal.contact_phone;
                        if (phone) {
                          const digits = phone.replace(/[^\d+]/g, "");
                          window.open(`sms:${digits.startsWith("+") ? digits : `+1${digits}`}`);
                        }
                      }}><MessageCircle className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Text {deal.contact_phone || "No Phone"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="sm"><Mail className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Email {deal.contact_email || `${deal.contact_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="space-y-1 text-small">
                <div className="flex items-center gap-2 text-content-secondary">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{deal.contact_phone || "(512) 555-0147"}</span>
                </div>
                <div className="flex items-center gap-2 text-content-secondary">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{deal.contact_email || `${deal.contact_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}</span>
                </div>
              </div>
            </div>
          </Card>

          {deal.notes && (
            <div>
              <h4 className="text-small font-semibold mb-2">Notes</h4>
              <p className="text-small text-content-secondary">{deal.notes}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-tiny text-content-tertiary">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Added {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last activity {formatDistanceToNow(new Date(deal.last_activity), { addSuffix: true })}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => navigate(`/properties/${deal.id}`)}>
            View Full Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

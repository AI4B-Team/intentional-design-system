import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Offer {
  id: string;
  amount: number;
  date: string;
  status: "pending" | "accepted" | "rejected" | "countered" | "expired";
  terms?: string;
  counterAmount?: number;
  notes?: string;
}

const sampleOffers: Offer[] = [
  {
    id: "1",
    amount: 285000,
    date: "Jan 24, 2026",
    status: "countered",
    counterAmount: 295000,
    terms: "As-is, 14-day close",
    notes: "Seller countered with higher price but accepted closing timeline.",
  },
  {
    id: "2",
    amount: 275000,
    date: "Jan 20, 2026",
    status: "rejected",
    terms: "As-is, 21-day close",
    notes: "Too low per seller, wants at least $290K.",
  },
  {
    id: "3",
    amount: 265000,
    date: "Jan 15, 2026",
    status: "expired",
    terms: "As-is, 30-day close",
    notes: "Initial offer, no response after 48 hours.",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusConfig(status: Offer["status"]) {
  switch (status) {
    case "accepted":
      return { label: "Accepted", variant: "success" as const, icon: CheckCircle2 };
    case "rejected":
      return { label: "Rejected", variant: "error" as const, icon: XCircle };
    case "countered":
      return { label: "Countered", variant: "warning" as const, icon: AlertCircle };
    case "expired":
      return { label: "Expired", variant: "secondary" as const, icon: Clock };
    default:
      return { label: "Pending", variant: "info" as const, icon: Clock };
  }
}

export function OffersTab() {
  const offers = sampleOffers;

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-content">Offer History</h3>
          <p className="text-small text-content-secondary">{offers.length} offers made</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus />}>
          New Offer
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        {/* Offer Cards */}
        <div className="space-y-4">
          {offers.map((offer, index) => {
            const statusConfig = getStatusConfig(offer.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={offer.id} className="relative flex gap-4">
                {/* Timeline Node */}
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white flex-shrink-0",
                    offer.status === "accepted" && "border-success",
                    offer.status === "rejected" && "border-destructive",
                    offer.status === "countered" && "border-warning",
                    offer.status === "expired" && "border-border",
                    offer.status === "pending" && "border-info"
                  )}
                >
                  <StatusIcon
                    className={cn(
                      "h-5 w-5",
                      offer.status === "accepted" && "text-success",
                      offer.status === "rejected" && "text-destructive",
                      offer.status === "countered" && "text-warning",
                      offer.status === "expired" && "text-content-tertiary",
                      offer.status === "pending" && "text-info"
                    )}
                  />
                </div>

                {/* Offer Card */}
                <Card
                  variant="default"
                  padding="md"
                  className={cn(
                    "flex-1 transition-all",
                    index === 0 && "ring-1 ring-brand-accent/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-h2 font-semibold text-content tabular-nums">
                          {formatCurrency(offer.amount)}
                        </span>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="text-small text-content-secondary">{offer.date}</div>
                    </div>

                    {offer.status === "countered" && offer.counterAmount && (
                      <div className="text-right">
                        <div className="text-tiny uppercase tracking-wide text-content-tertiary mb-0.5">
                          Counter
                        </div>
                        <div className="text-h3 font-semibold text-warning tabular-nums">
                          {formatCurrency(offer.counterAmount)}
                        </div>
                      </div>
                    )}
                  </div>

                  {offer.terms && (
                    <div className="flex items-center gap-2 text-small text-content-secondary mb-2">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{offer.terms}</span>
                    </div>
                  )}

                  {offer.notes && (
                    <p className="text-small text-content-secondary bg-surface-secondary/50 rounded-small p-3">
                      {offer.notes}
                    </p>
                  )}

                  {offer.status === "countered" && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="primary" size="sm">Accept Counter</Button>
                      <Button variant="secondary" size="sm">Counter Back</Button>
                      <Button variant="ghost" size="sm">Decline</Button>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

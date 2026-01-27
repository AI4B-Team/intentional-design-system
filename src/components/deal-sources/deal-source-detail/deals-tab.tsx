import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Home, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useDealSourceDeals } from "@/hooks/useDealSourceDetail";

interface DealsTabProps {
  sourceId: string;
  sourceName: string;
}

const statusColors: Record<string, string> = {
  new: "bg-info/10 text-info",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-brand/10 text-brand",
  offer_made: "bg-purple-100 text-purple-600",
  under_contract: "bg-success/10 text-success",
  closed: "bg-success/10 text-success",
  dead: "bg-destructive/10 text-destructive",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DealSourceDealsTab({ sourceId, sourceName }: DealsTabProps) {
  const navigate = useNavigate();
  const { data: deals, isLoading } = useDealSourceDeals(sourceId);

  if (isLoading) {
    return (
      <div className="p-lg space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-content">Deals from {sourceName}</h3>
          <p className="text-small text-content-secondary">{deals?.length || 0} properties</p>
        </div>
        <Button variant="secondary" size="sm" icon={<Plus />}>
          Send New Deal
        </Button>
      </div>

      {/* Deals List */}
      {!deals || deals.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <Home className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-content mb-2">No deals from this source yet</h4>
          <p className="text-small text-content-secondary mb-4">
            Properties linked to this source will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card
              key={deal.id}
              variant="default"
              padding="md"
              className="cursor-pointer hover:border-border transition-colors"
              onClick={() => navigate(`/properties/${deal.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-body font-medium text-content truncate">
                      {deal.address}
                    </span>
                    <Badge
                      className={cn("capitalize", statusColors[deal.status || "new"])}
                      size="sm"
                    >
                      {(deal.status || "new").replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-small text-content-secondary">
                    <span>
                      {deal.city}, {deal.state}
                    </span>
                    <span>•</span>
                    <span>
                      Received {deal.created_at ? format(parseISO(deal.created_at), "MMM d, yyyy") : "—"}
                    </span>
                    {deal.arv && (
                      <>
                        <span>•</span>
                        <span>ARV: {formatCurrency(deal.arv)}</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-content-tertiary flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

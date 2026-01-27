import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Percent,
  ArrowRight,
} from "lucide-react";
import type { JVOpportunity } from "@/hooks/useJVPartners";
import { formatDistanceToNow } from "date-fns";

interface JVOpportunityCardProps {
  opportunity: JVOpportunity;
  onExpressInterest?: (id: string) => void;
  onView?: (id: string) => void;
  isOwn?: boolean;
}

function formatCapital(amount: number | null): string {
  if (!amount) return "TBD";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "open":
      return "success";
    case "in_discussion":
      return "warning";
    case "closed":
      return "default";
    case "cancelled":
      return "error";
    default:
      return "secondary";
  }
}

export function JVOpportunityCard({
  opportunity,
  onExpressInterest,
  onView,
  isOwn = false,
}: JVOpportunityCardProps) {
  const postedAgo = formatDistanceToNow(new Date(opportunity.created_at), {
    addSuffix: true,
  });

  return (
    <Card variant="default" padding="md" className="hover:border-brand-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-body font-semibold text-content line-clamp-1">
            {opportunity.title}
          </h3>
          {opportunity.property && (
            <p className="text-small text-muted-foreground">
              {opportunity.property.address}, {opportunity.property.city}
            </p>
          )}
        </div>
        <Badge variant={getStatusVariant(opportunity.status)} size="sm">
          {opportunity.status.replace("_", " ")}
        </Badge>
      </div>

      {opportunity.description && (
        <p className="text-small text-muted-foreground line-clamp-2 mb-4">
          {opportunity.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Capital Needed */}
        <div className="flex items-center gap-2 text-small">
          <DollarSign className="h-4 w-4 text-success" />
          <div>
            <div className="text-muted-foreground">Capital Needed</div>
            <div className="font-semibold">{formatCapital(opportunity.capital_needed)}</div>
          </div>
        </div>

        {/* Split */}
        {opportunity.proposed_split && (
          <div className="flex items-center gap-2 text-small">
            <Percent className="h-4 w-4 text-info" />
            <div>
              <div className="text-muted-foreground">Split</div>
              <div className="font-semibold">{opportunity.proposed_split}</div>
            </div>
          </div>
        )}

        {/* Location */}
        {opportunity.location && (
          <div className="flex items-center gap-2 text-small">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Location</div>
              <div className="font-medium truncate">{opportunity.location}</div>
            </div>
          </div>
        )}

        {/* Deal Type */}
        {opportunity.deal_type && (
          <div className="flex items-center gap-2 text-small">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Deal Type</div>
              <div className="font-medium">{opportunity.deal_type}</div>
            </div>
          </div>
        )}
      </div>

      {/* Contribution & Seeking */}
      <div className="space-y-2 mb-4 text-small">
        {opportunity.your_contribution && (
          <div className="p-2 bg-success/5 rounded-md">
            <span className="text-muted-foreground">Bringing: </span>
            <span className="font-medium">{opportunity.your_contribution}</span>
          </div>
        )}
        {opportunity.seeking && (
          <div className="p-2 bg-info/5 rounded-md">
            <span className="text-muted-foreground">Seeking: </span>
            <span className="font-medium">{opportunity.seeking}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-1 text-tiny text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Posted {postedAgo}
        </div>
        
        {!isOwn ? (
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight />}
            iconPosition="right"
            onClick={() => onExpressInterest?.(opportunity.id)}
          >
            Express Interest
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView?.(opportunity.id)}
          >
            Manage
          </Button>
        )}
      </div>
    </Card>
  );
}

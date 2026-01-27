import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Percent, TrendingUp, ArrowRight } from "lucide-react";

export interface Lender {
  id: string;
  name: string;
  logo?: string;
  type: string;
  rating: number;
  reviewCount: number;
  rateRange: { min: number; max: number };
  maxLTV: number;
  fundingTime: string;
  minLoan: number;
  maxLoan: number;
  states: string[];
  featured?: boolean;
}

interface LenderCardProps {
  lender: Lender;
  onViewDetails: (id: string) => void;
  onRequestQuote: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function formatAmount(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}

export function LenderCard({
  lender,
  onViewDetails,
  onRequestQuote,
  className,
  style,
}: LenderCardProps) {
  return (
    <Card
      variant="interactive"
      padding="none"
      className={cn(
        "overflow-hidden group",
        lender.featured && "ring-2 ring-brand-accent",
        className
      )}
      style={style}
    >
      {/* Featured Badge */}
      {lender.featured && (
        <div className="bg-brand-accent text-white text-tiny font-medium px-3 py-1 text-center">
          Featured Lender
        </div>
      )}

      <div className="p-md">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo/Avatar */}
          <div className="h-14 w-14 rounded-medium bg-gradient-to-br from-brand-accent/20 to-brand/20 flex items-center justify-center flex-shrink-0">
            {lender.logo ? (
              <img src={lender.logo} alt={lender.name} className="h-10 w-10 object-contain" />
            ) : (
              <span className="text-h2 font-bold text-brand-accent">
                {lender.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-body font-semibold text-content truncate">
                {lender.name}
              </h3>
              <Badge variant="secondary" size="sm">
                {lender.type}
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-small font-medium text-content">{lender.rating.toFixed(1)}</span>
              <span className="text-small text-content-tertiary">({lender.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-tiny text-content-tertiary mb-1">
              <Percent className="h-3 w-3" />
              Rate
            </div>
            <div className="text-small font-semibold text-content">
              {lender.rateRange.min}% - {lender.rateRange.max}%
            </div>
          </div>
          <div className="text-center border-x border-border-subtle">
            <div className="flex items-center justify-center gap-1 text-tiny text-content-tertiary mb-1">
              <TrendingUp className="h-3 w-3" />
              Max LTV
            </div>
            <div className="text-small font-semibold text-content">
              {lender.maxLTV}%
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-tiny text-content-tertiary mb-1">
              <Clock className="h-3 w-3" />
              Funding
            </div>
            <div className="text-small font-semibold text-content">
              {lender.fundingTime}
            </div>
          </div>
        </div>

        {/* Loan Range */}
        <div className="text-small text-content-secondary mb-4">
          <span className="text-content-tertiary">Loan Range: </span>
          <span className="font-medium text-content">
            {formatAmount(lender.minLoan)} - {formatAmount(lender.maxLoan)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(lender.id)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            icon={<ArrowRight />}
            iconPosition="right"
            onClick={() => onRequestQuote(lender.id)}
          >
            Request Quote
          </Button>
        </div>
      </div>
    </Card>
  );
}

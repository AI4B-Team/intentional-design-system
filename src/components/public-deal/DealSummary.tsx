import React from 'react';
import { Bed, Bath, Ruler, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DispoDeal } from '@/hooks/usePublicDeal';

interface DealSummaryProps {
  deal: DispoDeal;
}

export function DealSummary({ deal }: DealSummaryProps) {
  const propertyTypeLabels: Record<string, string> = {
    sfh: 'Single Family Home',
    multi: 'Multi-Family',
    condo: 'Condo/Townhouse',
    land: 'Land',
    commercial: 'Commercial',
  };

  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {deal.address}
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          {deal.city}, {deal.state} {deal.zip}
        </p>
      </div>

      {/* Title/Headline */}
      {deal.title && (
        <p className="text-xl font-medium text-primary">
          {deal.title}
        </p>
      )}

      {/* Quick Stats */}
      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
        {deal.beds && (
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            <span>{deal.beds} Beds</span>
          </div>
        )}
        {deal.baths && (
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" />
            <span>{deal.baths} Baths</span>
          </div>
        )}
        {deal.sqft && (
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4" />
            <span>{deal.sqft.toLocaleString()} sqft</span>
          </div>
        )}
        {deal.year_built && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Built {deal.year_built}</span>
          </div>
        )}
      </div>

      {/* Property Type Badge */}
      {deal.property_type && (
        <Badge variant="secondary" className="text-sm">
          {propertyTypeLabels[deal.property_type] || deal.property_type}
        </Badge>
      )}

      {/* Investment Highlights */}
      {deal.investment_highlights && deal.investment_highlights.length > 0 && (
        <div className="bg-surface-secondary/50 rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Investment Highlights</h3>
          <ul className="space-y-3">
            {deal.investment_highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

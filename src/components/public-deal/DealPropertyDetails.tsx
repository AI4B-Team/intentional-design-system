import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DispoDeal } from '@/hooks/usePublicDeal';

interface DealPropertyDetailsProps {
  deal: DispoDeal;
}

export function DealPropertyDetails({ deal }: DealPropertyDetailsProps) {
  const propertyTypeLabels: Record<string, string> = {
    sfh: 'Single Family Home',
    multi: 'Multi-Family',
    condo: 'Condo/Townhouse',
    land: 'Land',
    commercial: 'Commercial',
  };

  const propertyInfo = [
    { label: 'Type', value: deal.property_type ? propertyTypeLabels[deal.property_type] || deal.property_type : null },
    { label: 'Beds', value: deal.beds },
    { label: 'Baths', value: deal.baths },
    { label: 'SqFt', value: deal.sqft?.toLocaleString() },
    { label: 'Lot Size', value: deal.lot_sqft ? `${deal.lot_sqft.toLocaleString()} sqft` : null },
    { label: 'Year Built', value: deal.year_built },
    { label: 'Stories', value: deal.stories },
    { label: 'Garage', value: deal.garage },
    { label: 'Pool', value: deal.pool !== null ? (deal.pool ? 'Yes' : 'No') : null },
  ].filter(item => item.value !== null && item.value !== undefined);

  const locationInfo = [
    { label: 'City', value: deal.city },
    { label: 'State', value: deal.state },
    { label: 'Zip', value: deal.zip },
    { label: 'County', value: deal.county },
    { label: 'Neighborhood', value: deal.neighborhood },
  ].filter(item => item.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Property Info */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Property Info</h4>
            <dl className="space-y-3">
              {propertyInfo.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Location</h4>
            <dl className="space-y-3">
              {locationInfo.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

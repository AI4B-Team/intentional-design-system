import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompData } from '@/hooks/usePublicDeal';

interface DealCompsProps {
  comps: CompData[];
  compsSummary: string | null;
}

export function DealComps({ comps, compsSummary }: DealCompsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparable Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {compsSummary && (
          <p className="text-muted-foreground mb-6">{compsSummary}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comps.slice(0, 4).map((comp, index) => (
            <div 
              key={index}
              className="bg-surface-secondary/50 border border-border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {comp.address}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <span className="font-semibold text-green-600">
                      ${comp.sale_price.toLocaleString()}
                    </span>
                    {comp.sale_date && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {new Date(comp.sale_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    {comp.beds && <span>{comp.beds} bd</span>}
                    {comp.baths && (
                      <>
                        <span>•</span>
                        <span>{comp.baths} ba</span>
                      </>
                    )}
                    {comp.sqft && (
                      <>
                        <span>•</span>
                        <span>{comp.sqft.toLocaleString()} sqft</span>
                      </>
                    )}
                    {comp.sqft && comp.sale_price && (
                      <>
                        <span>•</span>
                        <span>${Math.round(comp.sale_price / comp.sqft)}/sqft</span>
                      </>
                    )}
                  </div>
                  {comp.distance_miles !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {comp.distance_miles.toFixed(1)} miles away
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Full comp package available for verified buyers
        </p>
      </CardContent>
    </Card>
  );
}

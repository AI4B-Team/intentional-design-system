import React from 'react';
import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DealRepairsProps {
  repairEstimate: number;
  repairDetails: string | null;
}

export function DealRepairs({ repairEstimate, repairDetails }: DealRepairsProps) {
  // Try to parse repair details as a list
  const repairItems = repairDetails
    ? repairDetails.split('\n').filter(line => line.trim())
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          Estimated Repairs: ${repairEstimate.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {repairItems.length > 0 ? (
          <div className="space-y-2">
            {repairItems.map((item, index) => {
              // Try to parse "Item: $Amount" format
              const match = item.match(/^(.+?):\s*\$?([\d,]+)/);
              if (match) {
                return (
                  <div key={index} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground">{match[1].trim()}</span>
                    <span className="font-medium text-foreground">${match[2]}</span>
                  </div>
                );
              }
              return (
                <div key={index} className="py-2 text-foreground">
                  • {item}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Detailed scope of work available for verified buyers.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DealDescriptionProps {
  description: string;
}

export function DealDescription({ description }: DealDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Property</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-foreground">
          {description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

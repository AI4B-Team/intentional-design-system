import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export function CopilotTemplatesTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Quick conversation templates</p>
      {[
        { label: 'Opening - Cold Lead', category: 'Opening' },
        { label: 'Opening - Warm Lead', category: 'Opening' },
        { label: 'Price Discovery', category: 'Discovery' },
        { label: 'Motivation Questions', category: 'Discovery' },
        { label: 'Seller Financing Pitch', category: 'Negotiation' },
        { label: 'Subject-To Explanation', category: 'Negotiation' },
        { label: 'Close - Set Appointment', category: 'Closing' },
        { label: 'Close - Send Offer', category: 'Closing' },
      ].map((template, i) => (
        <button
          key={i}
          className="w-full text-left p-3 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{template.label}</span>
            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
          </div>
        </button>
      ))}
    </div>
  );
}

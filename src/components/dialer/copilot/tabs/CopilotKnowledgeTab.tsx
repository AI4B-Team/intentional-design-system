import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

export function CopilotKnowledgeTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Train the AI on your processes</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Company Info', count: 3 },
          { label: 'Pricing Rules', count: 5 },
          { label: 'Market Data', count: 12 },
          { label: 'Scripts', count: 8 },
        ].map((kb, i) => (
          <div key={i} className="p-3 rounded-lg border border-border-subtle bg-muted/30">
            <p className="text-sm font-medium">{kb.label}</p>
            <p className="text-xs text-muted-foreground">{kb.count} documents</p>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full">
        <Settings2 className="h-4 w-4 mr-2" />
        Manage Knowledge Base
      </Button>
    </div>
  );
}

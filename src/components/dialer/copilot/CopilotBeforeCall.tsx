import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, TrendingUp, Clock, DollarSign, Phone, AlertCircle } from 'lucide-react';
import type { BriefingData } from './types';

interface CopilotBeforeCallProps {
  briefing: BriefingData | null;
  isLoading: boolean;
  contactName?: string;
}

export function CopilotBeforeCall({ briefing, isLoading, contactName }: CopilotBeforeCallProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">AI Copilot Loading...</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="bg-muted/50 border border-border-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span className="text-sm">Select a contact to get AI briefing</span>
        </div>
      </div>
    );
  }

  const urgencyColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  const urgencyIcons = {
    high: <AlertCircle className="h-3 w-3" />,
    medium: <Clock className="h-3 w-3" />,
    low: <Phone className="h-3 w-3" />,
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Pre-Call Briefing</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] uppercase tracking-wide", urgencyColors[briefing.urgency])}
        >
          {urgencyIcons[briefing.urgency]}
          <span className="ml-1">{briefing.urgency} Priority</span>
        </Badge>
      </div>

      {/* One-liner */}
      <div className="px-4 py-3 border-b border-primary/10">
        <p className="text-sm font-medium text-foreground">{briefing.oneLiner}</p>
      </div>

      {/* AI Insight */}
      {briefing.insight && (
        <div className="px-4 py-3 bg-white/50 border-b border-primary/10">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground/80 italic">{briefing.insight}</p>
          </div>
        </div>
      )}

      {/* Key Facts */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {briefing.keyFacts.lastOffer && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Last Offer</p>
              <p className="text-sm font-medium">${(briefing.keyFacts.lastOffer / 1000).toFixed(0)}k</p>
            </div>
          </div>
        )}
        {briefing.keyFacts.arv && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">ARV</p>
              <p className="text-sm font-medium">${(briefing.keyFacts.arv / 1000).toFixed(0)}k</p>
            </div>
          </div>
        )}
        {briefing.keyFacts.equityPct && (
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Equity</p>
              <p className="text-sm font-medium">{briefing.keyFacts.equityPct}%</p>
            </div>
          </div>
        )}
        {briefing.keyFacts.callCount > 0 && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Previous Calls</p>
              <p className="text-sm font-medium">{briefing.keyFacts.callCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Approach */}
      <div className="px-4 py-2 bg-primary/5 border-t border-primary/10">
        <p className="text-xs text-muted-foreground">
          Recommended: <span className="font-medium text-primary">{briefing.recommendedApproach}</span>
        </p>
      </div>
    </div>
  );
}

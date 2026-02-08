import React from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfferInsightCardProps {
  insight: string | null;
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export function OfferInsightCard({ 
  insight, 
  isLoading, 
  error,
  onRefresh,
  className 
}: OfferInsightCardProps) {
  // Silently fail - AI insights are non-critical, don't show error UI
  if (error && !isLoading) {
    return null;
  }
  
  // Don't render if no insight and not loading
  if (!insight && !isLoading) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
      className
    )}>
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
        {isLoading ? (
          <RefreshCw className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-primary">AI Insight</span>
          {onRefresh && !isLoading && (
            <button
              onClick={onRefresh}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="space-y-1.5">
            <div className="h-3 bg-primary/20 rounded animate-pulse w-full" />
            <div className="h-3 bg-primary/20 rounded animate-pulse w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
        )}
      </div>
    </div>
  );
}

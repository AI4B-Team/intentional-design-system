import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, RefreshCw, MessageSquare, Copy, ThumbsUp, ThumbsDown, Play, TrendingUp, Eye, Lightbulb } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Suggestion {
  id: string;
  type: 'response' | 'question' | 'coach';
  text: string;
  reasoning?: string;
  confidence?: number;
}

interface CallStats {
  objections: number;
  talkRatio: number;
  nextSteps: number;
}

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
  stats?: CallStats;
  isLoading?: boolean;
  onUseSuggestion?: (suggestion: Suggestion) => void;
  onCopySuggestion?: (text: string) => void;
  onThumbsUp?: (suggestion: Suggestion) => void;
  onThumbsDown?: (suggestion: Suggestion) => void;
  onRefresh?: () => void;
}

export function SmartSuggestions({
  suggestions,
  stats,
  isLoading = false,
  onUseSuggestion,
  onCopySuggestion,
  onThumbsUp,
  onThumbsDown,
  onRefresh,
}: SmartSuggestionsProps) {
  const typeConfig = {
    response: {
      badge: 'bg-warning/10 text-warning border-warning/20',
      label: 'Response',
      icon: MessageSquare,
    },
    question: {
      badge: 'bg-info/10 text-info border-info/20',
      label: 'Question',
      icon: TrendingUp,
    },
    coach: {
      badge: 'bg-muted text-muted-foreground border-border',
      label: 'Coach Tip',
      icon: Eye,
    },
  };

  return (
    <div className="bg-white border border-border-subtle rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-foreground">Smart Suggestions</span>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-7 text-xs gap-1"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        )}
      </div>

      {/* Suggestions List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Listening for context to generate suggestions...
            </p>
          ) : (
            suggestions.map((suggestion) => {
              const config = typeConfig[suggestion.type];
              const Icon = config.icon;
              
              return (
                <div
                  key={suggestion.id}
                  className="border border-border-subtle rounded-lg p-4 space-y-3"
                >
                  {/* Header with badge and confidence */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-medium', config.badge)}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {suggestion.confidence && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {suggestion.confidence}%
                      </span>
                    )}
                  </div>

                  {/* Main suggestion text */}
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {suggestion.text}
                  </p>

                  {/* Reasoning */}
                  {suggestion.reasoning && (
                    <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                      <Lightbulb className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
                      {suggestion.reasoning}
                    </p>
                  )}

                  {/* Actions - only show for response type */}
                  {suggestion.type === 'response' && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onUseSuggestion?.(suggestion)}
                        className="h-9 text-xs gap-1.5 flex-1 bg-success hover:bg-success/90"
                      >
                        <Play className="h-3 w-3" />
                        Use This
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopySuggestion?.(suggestion.text)}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onThumbsUp?.(suggestion)}
                        className="h-9 w-9 p-0 text-success hover:text-success hover:bg-success/10"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onThumbsDown?.(suggestion)}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Call Stats Footer */}
      {stats && (
        <div className="border-t border-border-subtle p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{stats.objections}</p>
              <p className="text-xs text-muted-foreground">Objections</p>
            </div>
            <div>
              <p className="text-xl font-bold text-success">
                {stats.talkRatio}%
              </p>
              <p className="text-xs text-muted-foreground">Talk Ratio</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.nextSteps}</p>
              <p className="text-xs text-muted-foreground">Next Steps</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

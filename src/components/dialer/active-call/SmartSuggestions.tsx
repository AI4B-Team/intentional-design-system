import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, MessageSquare, Copy, ThumbsUp, ThumbsDown, Play } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'response' | 'question' | 'objection';
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
  const typeStyles = {
    response: {
      badge: 'bg-primary/10 text-primary',
      label: 'Response',
    },
    question: {
      badge: 'bg-info/10 text-info',
      label: 'Question',
    },
    objection: {
      badge: 'bg-warning/10 text-warning',
      label: 'Objection',
    },
  };

  return (
    <div className="space-y-4">
      {/* Smart Suggestions */}
      <div className="bg-white border border-border-subtle rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
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

        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Listening for context to generate suggestions...
            </p>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-border-subtle rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={cn('text-[10px]', typeStyles[suggestion.type].badge)}
                  >
                    <MessageSquare className="h-2.5 w-2.5 mr-1" />
                    {typeStyles[suggestion.type].label}
                  </Badge>
                  {suggestion.confidence && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {suggestion.confidence}%
                    </span>
                  )}
                </div>

                <p className="text-sm text-foreground leading-relaxed">{suggestion.text}</p>

                {suggestion.reasoning && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 {suggestion.reasoning}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onUseSuggestion?.(suggestion)}
                    className="h-8 text-xs gap-1.5 flex-1"
                  >
                    <Play className="h-3 w-3" />
                    Use This
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopySuggestion?.(suggestion.text)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onThumbsUp?.(suggestion)}
                    className="h-8 w-8 p-0"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onThumbsDown?.(suggestion)}
                    className="h-8 w-8 p-0"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Call Stats */}
      {stats && (
        <div className="bg-white border border-border-subtle rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.objections}</p>
              <p className="text-xs text-muted-foreground">Objections</p>
            </div>
            <div>
              <p className={cn(
                'text-2xl font-bold',
                stats.talkRatio > 70 ? 'text-warning' : 'text-success'
              )}>
                {stats.talkRatio}%
              </p>
              <p className="text-xs text-muted-foreground">Talk Ratio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.nextSteps}</p>
              <p className="text-xs text-muted-foreground">Next Steps</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

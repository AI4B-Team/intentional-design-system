import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  Send,
  X,
  Copy,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import type { SuggestionsData, ObjectionData, SentimentData } from './types';

interface CopilotDuringCallProps {
  suggestions: SuggestionsData | null;
  objectionResponse: ObjectionData | null;
  sentiment: SentimentData | null;
  isLoading: boolean;
  onObjectionSubmit: (text: string) => void;
  onClearObjection: () => void;
  onSuggestionClick?: (text: string) => void;
  onRefreshSuggestions?: () => void;
}

export function CopilotDuringCall({
  suggestions,
  objectionResponse,
  sentiment,
  isLoading,
  onObjectionSubmit,
  onClearObjection,
  onSuggestionClick,
  onRefreshSuggestions,
}: CopilotDuringCallProps) {
  const [objectionInput, setObjectionInput] = React.useState('');

  const handleObjectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (objectionInput.trim()) {
      onObjectionSubmit(objectionInput.trim());
      setObjectionInput('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const sentimentConfig = {
    interested: { icon: ThumbsUp, color: 'text-success', bg: 'bg-success/10', label: 'Interested' },
    neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Neutral' },
    resistant: { icon: ThumbsDown, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Resistant' },
  };

  const phaseLabels = {
    opening: 'Opening',
    discovery: 'Discovery',
    negotiation: 'Negotiation',
    closing: 'Closing',
  };

  const priorityStyles = {
    high: 'bg-primary text-primary-foreground hover:bg-primary/90',
    medium: 'bg-primary/20 text-primary hover:bg-primary/30',
    low: 'bg-muted text-muted-foreground hover:bg-muted/80',
  };

  return (
    <div className="space-y-4">
      {/* Live Sentiment Indicator */}
      {sentiment && (
        <div className={cn(
          "flex items-center justify-between px-4 py-2 rounded-lg",
          sentimentConfig[sentiment.sentiment].bg
        )}>
          <div className="flex items-center gap-2">
            {React.createElement(sentimentConfig[sentiment.sentiment].icon, {
              className: cn("h-4 w-4", sentimentConfig[sentiment.sentiment].color)
            })}
            <span className={cn("text-sm font-medium", sentimentConfig[sentiment.sentiment].color)}>
              {sentimentConfig[sentiment.sentiment].label}
            </span>
            {sentiment.confidence > 0.7 && (
              <Badge variant="outline" className="text-[10px]">
                {Math.round(sentiment.confidence * 100)}% confident
              </Badge>
            )}
          </div>
          {sentiment.indicators.length > 0 && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {sentiment.indicators[0]}
            </span>
          )}
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Live Suggestions</span>
            {suggestions?.phase && (
              <Badge variant="outline" className="text-[10px] bg-white/50">
                {phaseLabels[suggestions.phase]}
              </Badge>
            )}
          </div>
          {onRefreshSuggestions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshSuggestions}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {isLoading && !suggestions ? (
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
        ) : suggestions?.suggestions.length ? (
          <div className="flex flex-wrap gap-2">
            {suggestions.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion.text)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  "hover:scale-105 active:scale-95",
                  priorityStyles[suggestion.priority]
                )}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Listening for context...</p>
        )}
      </div>

      {/* Objection Handler */}
      <div className="bg-white border border-border-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Objection Handler</span>
          <Badge variant="secondary" className="text-[10px]">10K+ responses</Badge>
        </div>

        {objectionResponse ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <Badge variant="outline" className="text-[10px]">
                {objectionResponse.category}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearObjection}
                className="h-6 w-6 p-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{objectionResponse.suggestedResponse}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(objectionResponse.suggestedResponse)}
                className="mt-2 h-7 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>

            {objectionResponse.alternativeResponses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Alternatives:</p>
                {objectionResponse.alternativeResponses.map((alt, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(alt)}
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {alt.length > 100 ? alt.slice(0, 100) + '...' : alt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleObjectionSubmit} className="flex gap-2">
            <Input
              value={objectionInput}
              onChange={(e) => setObjectionInput(e.target.value)}
              placeholder="Type seller's objection..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={!objectionInput.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

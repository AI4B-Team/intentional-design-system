import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Clock,
  MessageSquare,
  Copy,
  Check,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type MessageAnalysis,
  getPriorityColor,
  getPriorityBg,
  getSentimentDisplay,
} from "@/hooks/useInboxAI";
import { toast } from "sonner";

interface MessageAnalysisPanelProps {
  analysis: MessageAnalysis | null;
  isLoading?: boolean;
  onAnalyze?: () => void;
  className?: string;
}

export function MessageAnalysisPanel({
  analysis,
  isLoading,
  onAnalyze,
  className,
}: MessageAnalysisPanelProps) {
  const [copiedSuggestion, setCopiedSuggestion] = React.useState(false);

  const handleCopySuggestion = async () => {
    if (!analysis?.suggestedResponse) return;
    await navigator.clipboard.writeText(analysis.suggestedResponse);
    setCopiedSuggestion(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSuggestion(false), 2000);
  };

  if (isLoading) {
    return (
      <Card className={cn("p-4 space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-brand animate-pulse" />
          <span className="text-small font-medium">Analyzing message...</span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  if (!analysis && onAnalyze) {
    return (
      <Card className={cn("p-4", className)}>
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={onAnalyze}
        >
          <Sparkles className="h-4 w-4" />
          Analyze with AI
        </Button>
      </Card>
    );
  }

  if (!analysis) return null;

  const sentiment = getSentimentDisplay(analysis.sentiment.type);

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-brand/5 to-brand/10 border-b border-border-subtle flex items-center gap-2">
        <Brain className="h-4 w-4 text-brand" />
        <span className="text-small font-semibold">AI Analysis</span>
        <Zap className="h-3 w-3 text-warning ml-auto" />
      </div>

      <div className="p-4 space-y-4">
        {/* Priority & Sentiment Row */}
        <div className="flex items-stretch gap-3">
          {/* Priority Score */}
          <div className={cn(
            "flex-1 p-3 rounded-lg border",
            getPriorityBg(analysis.priority.level)
          )}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={cn("h-4 w-4", getPriorityColor(analysis.priority.level))} />
              <span className="text-tiny font-medium text-content-secondary">Priority</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-2xl font-bold", getPriorityColor(analysis.priority.level))}>
                {analysis.priority.score}
              </span>
              <Badge variant={
                analysis.priority.level === 'urgent' ? 'destructive' :
                analysis.priority.level === 'high' ? 'warning' :
                'secondary'
              } size="sm" className="uppercase">
                {analysis.priority.level}
              </Badge>
            </div>
            <p className="text-tiny text-content-tertiary mt-1 line-clamp-2">
              {analysis.priority.reason}
            </p>
          </div>

          {/* Sentiment */}
          <div className="flex-1 p-3 rounded-lg border border-border-subtle bg-surface-secondary">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{sentiment.emoji}</span>
              <span className="text-tiny font-medium text-content-secondary">Sentiment</span>
            </div>
            <div className={cn("text-lg font-semibold", sentiment.color)}>
              {sentiment.label}
            </div>
            {analysis.sentiment.indicators.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.sentiment.indicators.slice(0, 2).map((indicator, i) => (
                  <Badge key={i} variant="secondary" size="sm" className="text-tiny">
                    "{indicator}"
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-content-tertiary" />
            <span className="text-tiny font-medium text-content-secondary">Summary</span>
          </div>
          <p className="text-small text-content">{analysis.summary}</p>
        </div>

        {/* Response Time Alert */}
        {analysis.responseTimeAlert.shouldAlert && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-small font-medium text-warning">
                Time-Sensitive
              </span>
            </div>
            <p className="text-small text-content-secondary mt-1">
              {analysis.responseTimeAlert.message}
            </p>
            {analysis.responseTimeAlert.deadline && (
              <div className="flex items-center gap-1 mt-2 text-tiny text-content-tertiary">
                <Clock className="h-3 w-3" />
                <span>Respond by: {new Date(analysis.responseTimeAlert.deadline).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Suggested Response */}
        <div className="p-3 bg-brand/5 border border-brand/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="text-tiny font-medium text-brand">Suggested Response</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleCopySuggestion}
            >
              {copiedSuggestion ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <p className="text-small text-content italic">
            "{analysis.suggestedResponse}"
          </p>
        </div>
      </div>
    </Card>
  );
}

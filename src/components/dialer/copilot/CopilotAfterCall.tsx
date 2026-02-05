import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  Mail, 
  TrendingUp,
  ArrowRight,
  Copy,
  Send,
  DollarSign,
} from 'lucide-react';
import type { PostCallData } from './types';

interface CopilotAfterCallProps {
  postCallActions: PostCallData | null;
  isLoading: boolean;
  onCreateTask?: (task: PostCallData['followUpTask']) => void;
  onSendSms?: (message: string) => void;
  onSendEmail?: (email: { subject: string; body: string }) => void;
  onUpdateStage?: (stage: string) => void;
}

export function CopilotAfterCall({
  postCallActions,
  isLoading,
  onCreateTask,
  onSendSms,
  onSendEmail,
  onUpdateStage,
}: CopilotAfterCallProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success animate-pulse" />
          <span className="text-sm font-medium text-success">Generating next steps...</span>
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!postCallActions) {
    return null;
  }

  const stageColors: Record<string, string> = {
    lead: 'bg-muted text-muted-foreground',
    prospect: 'bg-blue-100 text-blue-700',
    negotiating: 'bg-amber-100 text-amber-700',
    under_contract: 'bg-primary/20 text-primary',
    closed: 'bg-success/20 text-success',
    dead: 'bg-destructive/20 text-destructive',
  };

  const priorityColors = {
    high: 'border-destructive/50 bg-destructive/5',
    medium: 'border-warning/50 bg-warning/5',
    low: 'border-border bg-muted/50',
  };

  return (
    <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-success/10 border-b border-success/20 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-success" />
        <span className="text-sm font-semibold text-success">Post-Call Actions</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Stage Suggestion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Move to stage:</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStage?.(postCallActions.suggestedStage)}
            className={cn("capitalize", stageColors[postCallActions.suggestedStage])}
          >
            {postCallActions.suggestedStage.replace('_', ' ')}
          </Button>
        </div>

        {/* Follow-up Task */}
        {postCallActions.followUpTask && (
          <div className={cn(
            "border rounded-lg p-3",
            priorityColors[postCallActions.followUpTask.priority]
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{postCallActions.followUpTask.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due in {postCallActions.followUpTask.dueInDays} day{postCallActions.followUpTask.dueInDays !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCreateTask?.(postCallActions.followUpTask)}
              >
                Create Task
              </Button>
            </div>
          </div>
        )}

        {/* Draft SMS */}
        {postCallActions.draftSms && (
          <div className="bg-white border border-border-subtle rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Draft SMS
              </span>
            </div>
            <p className="text-sm text-foreground mb-3 bg-muted/50 rounded p-2">
              {postCallActions.draftSms}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(postCallActions.draftSms!)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSendSms?.(postCallActions.draftSms!)}
              >
                <Send className="h-3 w-3 mr-1" />
                Send SMS
              </Button>
            </div>
          </div>
        )}

        {/* Draft Email */}
        {postCallActions.draftEmail && (
          <div className="bg-white border border-border-subtle rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Draft Email
              </span>
            </div>
            <p className="text-sm font-medium mb-1">{postCallActions.draftEmail.subject}</p>
            <p className="text-sm text-muted-foreground mb-3 bg-muted/50 rounded p-2 line-clamp-3">
              {postCallActions.draftEmail.body}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(
                  `Subject: ${postCallActions.draftEmail!.subject}\n\n${postCallActions.draftEmail!.body}`
                )}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSendEmail?.(postCallActions.draftEmail!)}
              >
                <Send className="h-3 w-3 mr-1" />
                Send Email
              </Button>
            </div>
          </div>
        )}

        {/* Offer Adjustment */}
        {postCallActions.offerAdjustment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Consider {postCallActions.offerAdjustment.direction === 'increase' ? 'increasing' : 
                    postCallActions.offerAdjustment.direction === 'decrease' ? 'decreasing' : 'adjusting'} your offer
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {postCallActions.offerAdjustment.reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

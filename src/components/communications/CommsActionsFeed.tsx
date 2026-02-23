import * as React from "react";
import { cn } from "@/lib/utils";
import { useCommsActions, useCompleteAction, type UnifiedAction } from "@/hooks/useUnifiedActions";
import { Phone, MessageCircle, Mail, Voicemail, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";

const ACTION_ICON: Record<string, React.ElementType> = {
  call: Phone,
  sms: MessageCircle,
  email: Mail,
  voicemail: Voicemail,
  follow_up: Phone,
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: "border-l-destructive bg-destructive/5",
  high: "border-l-amber-500 bg-amber-500/5",
  medium: "border-l-primary bg-primary/5",
  low: "border-l-border bg-muted/30",
};

function ActionItem({ action, onComplete }: { action: UnifiedAction; onComplete: (id: string) => void }) {
  const Icon = ACTION_ICON[action.type] || Phone;
  const isOverdue = action.status === "overdue" || (action.status === "pending" && action.due_at && new Date(action.due_at) < new Date());
  const dueLabel = action.due_at
    ? formatDistanceToNow(parseISO(action.due_at), { addSuffix: true })
    : "No due date";

  return (
    <div className={cn(
      "flex items-start gap-2.5 p-2.5 rounded-md border-l-[3px] transition-colors",
      PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.low,
    )}>
      <div className={cn(
        "mt-0.5 h-6 w-6 rounded-md flex items-center justify-center shrink-0",
        isOverdue ? "bg-destructive/10" : "bg-primary/10",
      )}>
        <Icon className={cn("h-3.5 w-3.5", isOverdue ? "text-destructive" : "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground truncate">{action.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {action.contact_name && (
            <span className="text-[10px] text-muted-foreground truncate">{action.contact_name}</span>
          )}
          <span className={cn("text-[10px] font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
            {isOverdue && <AlertCircle className="h-2.5 w-2.5 inline mr-0.5" />}
            {dueLabel}
          </span>
        </div>
        {action.owner_mode === "ai_agent" && (
          <div className="flex items-center gap-1 mt-1">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            <span className="text-[10px] text-primary font-medium">AI Managed</span>
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
        onClick={() => onComplete(action.id)}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function CommsActionsFeed({ compact = false }: { compact?: boolean }) {
  const { data: actions = [], isLoading } = useCommsActions();
  const completeAction = useCompleteAction();

  const handleComplete = (id: string) => {
    completeAction.mutate(id);
    toast.success("Action completed — synced across all surfaces");
  };

  const displayActions = compact ? actions.slice(0, 5) : actions;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-md bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (displayActions.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
        <div className="text-xs text-muted-foreground">All caught up — no pending actions</div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {displayActions.map(action => (
        <ActionItem key={action.id} action={action} onComplete={handleComplete} />
      ))}
      {compact && actions.length > 5 && (
        <div className="text-center pt-1">
          <span className="text-[10px] text-muted-foreground">{actions.length - 5} more actions</span>
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAIActions, useCompleteAction, type UnifiedAction } from "@/hooks/useUnifiedActions";
import { Bot, Sparkles, Zap, CheckCircle2, Clock, AlertCircle, Phone, MessageCircle, Mail, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";

const TYPE_ICON: Record<string, React.ElementType> = {
  call: Phone,
  sms: MessageCircle,
  email: Mail,
  follow_up: Phone,
  appointment: Calendar,
  deadline: AlertCircle,
  task: FileText,
};

const SOURCE_LABEL: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ai: { label: "AI", icon: Sparkles, color: "text-primary" },
  automation: { label: "Automation", icon: Zap, color: "text-warning" },
};

function AIActionItem({ action, onComplete }: { action: UnifiedAction; onComplete: (id: string) => void }) {
  const Icon = TYPE_ICON[action.type] || FileText;
  const source = SOURCE_LABEL[action.source] || SOURCE_LABEL.automation;
  const SourceIcon = source.icon;
  const isCompleted = action.status === "completed";
  const isOverdue = action.status === "overdue";
  const dueLabel = action.due_at
    ? formatDistanceToNow(parseISO(action.due_at), { addSuffix: true })
    : null;

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      isCompleted
        ? "border-border/50 bg-muted/20 opacity-60"
        : isOverdue
          ? "border-destructive/30 bg-destructive/5"
          : "border-border hover:bg-muted/30",
    )}>
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
        isCompleted ? "bg-success/10" : "bg-primary/10",
      )}>
        <Icon className={cn("h-4 w-4", isCompleted ? "text-success" : "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium truncate", isCompleted && "line-through text-muted-foreground")}>
            {action.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <div className="flex items-center gap-1">
            <SourceIcon className={cn("h-3 w-3", source.color)} />
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", source.color)}>{source.label}</span>
          </div>
          {action.property_address && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{action.property_address}</span>
          )}
          {dueLabel && (
            <span className={cn("text-[10px]", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
              <Clock className="h-2.5 w-2.5 inline mr-0.5" />{dueLabel}
            </span>
          )}
        </div>
        {action.source_ref && (
          <div className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            ref: {action.source_ref}
          </div>
        )}
      </div>
      {!isCompleted && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-success hover:bg-success/10"
          onClick={() => onComplete(action.id)}
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function AIActionsLog() {
  const { data: actions = [], isLoading } = useAIActions();
  const completeAction = useCompleteAction();

  const handleComplete = (id: string) => {
    completeAction.mutate(id);
    toast.success("Action completed");
  };

  const pendingCount = actions.filter(a => a.status !== "completed").length;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Actions Log</h3>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {pendingCount} pending
          </Badge>
        )}
      </div>
      {actions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Sparkles className="h-5 w-5 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No AI-generated actions yet</p>
          <p className="text-[10px] mt-1">Actions will appear here when AI or automations create tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map(action => (
            <AIActionItem key={action.id} action={action} onComplete={handleComplete} />
          ))}
        </div>
      )}
    </div>
  );
}

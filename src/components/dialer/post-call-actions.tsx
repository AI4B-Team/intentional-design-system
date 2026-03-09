import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, MessageCircle, Mail, Calendar, ArrowRight, Sparkles, FileText } from "lucide-react";
import { useCallState, type PostCallAction } from "@/contexts/CallContext";

const ACTION_ICONS: Record<string, React.ElementType> = {
  follow_up_task: Calendar,
  sms_draft: MessageCircle,
  email_summary: Mail,
  reminder: Calendar,
  pipeline_update: ArrowRight,
  offer_logged: FileText,
};

const ACTION_COLORS: Record<string, string> = {
  follow_up_task: "text-info bg-info/10",
  sms_draft: "text-accent-foreground bg-accent/30",
  email_summary: "text-warning bg-warning/10",
  reminder: "text-success bg-success/10",
  pipeline_update: "text-primary bg-primary/10",
  offer_logged: "text-destructive bg-destructive/10",
};

export function PostCallActions() {
  const { postCallActions, callStatus } = useCallState();

  if (callStatus !== "ended" || postCallActions.length === 0) return null;

  return (
    <div className="p-4 bg-success/5 rounded-xl border border-success/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-success" />
        <span className="text-[13px] font-semibold text-foreground">Post-Call Automation</span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
          {postCallActions.filter(a => a.completed).length}/{postCallActions.length} Complete
        </span>
      </div>
      <div className="space-y-2">
        {postCallActions.map((action) => {
          const Icon = ACTION_ICONS[action.type] || CheckCircle;
          const colorClass = ACTION_COLORS[action.type] || "text-muted-foreground bg-muted";
          return (
            <div key={action.id} className="flex items-start gap-2.5 py-1.5">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5", colorClass)}>
                {action.completed ? (
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-semibold", action.completed ? "text-foreground" : "text-muted-foreground")}>
                  {action.label}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{action.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

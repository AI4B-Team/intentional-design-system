import * as React from "react";
import type { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Phone, MessageSquare, CalendarClock, CheckCircle2, Clock, Sparkles } from "lucide-react";
import type { CalendarEvent } from "@/components/calendar/types";
import type { useCompleteAction, useUpdateAction } from "@/hooks/useUnifiedActions";
import { handleQuickAction } from "@/components/calendar/calendar-constants";

export function EventActions({ event, navigate, completeAction, updateAction, onReschedule }: { 
  event: CalendarEvent; 
  navigate: ReturnType<typeof useNavigate>;
  completeAction?: ReturnType<typeof useCompleteAction>;
  updateAction?: ReturnType<typeof useUpdateAction>;
  onReschedule?: (event: CalendarEvent) => void;
}) {
  const isActionable = event.isOverdue || event.type === "followup" || event.type === "offer_deadline";
  if (!isActionable) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-border mt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-emerald-300 text-emerald-600 hover:bg-emerald-50 shadow-sm" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "call", completeAction, updateAction, onReschedule); }}>
              <Phone className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Call Now</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "sms", completeAction, updateAction, onReschedule); }}>
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">SMS</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "reschedule", completeAction, updateAction, onReschedule); }}>
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Reschedule</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "complete", completeAction, updateAction, onReschedule); }}>
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Complete</p></TooltipContent>
        </Tooltip>
        {event.id.startsWith("ua-") && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "snooze", completeAction, updateAction, onReschedule); }}>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Snooze to tomorrow</p></TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

export function AIContext({ event }: { event: CalendarEvent }) {
  if (!event.isOverdue && event.type !== "followup") return null;
  const contextParts: string[] = [];
  if (event.lastContactDays !== undefined) contextParts.push(`Last contact: ${event.lastContactDays}d ago`);
  if (event.meta?.notes) {
    const snippet = event.meta.notes.length > 60 ? event.meta.notes.slice(0, 60) + "…" : event.meta.notes;
    contextParts.push(snippet);
  }
  if (contextParts.length === 0) return null;

  return (
    <div className="flex items-start gap-1.5 mt-1.5 px-1 py-1 rounded bg-muted/50">
      <Sparkles className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-[10px] text-muted-foreground leading-tight">{contextParts.join(" · ")}</p>
    </div>
  );
}

import * as React from "react";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import type { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Phone, FileText, Home, AlertCircle } from "lucide-react";
import type { CalendarEvent } from "@/components/calendar/types";
import type { useCompleteAction, useUpdateAction } from "@/hooks/useUnifiedActions";

export type ViewMode = "month" | "week" | "day";
export type CalendarViewTab = "calendar" | "plan" | "kanban" | "grid" | "feed";

export const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  appointment: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", label: "Appointment" },
  followup: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Follow-Up" },
  offer_deadline: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", label: "Deadline" },
  closing: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Closing" },
  inspection: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Inspection" },
};

export const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  high: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  critical: { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/40" },
};

export const EVENT_ICONS: Record<string, React.ElementType> = {
  appointment: CalendarIcon,
  followup: Phone,
  offer_deadline: FileText,
  closing: Home,
  inspection: AlertCircle,
};

export function getUrgency(event: CalendarEvent): "low" | "medium" | "high" | "critical" {
  if (event.status === "overdue") {
    const daysOverdue = differenceInDays(new Date(), event.date);
    if (daysOverdue > 7) return "critical";
    if (daysOverdue > 3) return "high";
    return "medium";
  }
  if (event.type === "offer_deadline") return "high";
  if (event.type === "followup") return "low";
  return "low";
}

// ─── Deep-link navigation ─────────────────────────────────
export function getEventNavigation(event: CalendarEvent): string {
  if (event.type === "followup" || event.isOverdue) {
    const params = new URLSearchParams();
    if (event.contactName) params.set("contact", event.contactName);
    if (event.propertyId) params.set("property", event.propertyId);
    params.set("filter", "needs_action");
    params.set("channel", "calls");
    return `/communications?${params.toString()}`;
  }
  if (event.type === "appointment") {
    if (event.propertyId) return `/communications?property=${event.propertyId}&channel=calls`;
    return "/communications";
  }
  if (event.propertyId) return `/properties/${event.propertyId}`;
  return "#";
}

// ─── Action handlers ──────────────────────────────────────
export function handleQuickAction(
  navigate: ReturnType<typeof useNavigate>,
  event: CalendarEvent,
  action: "call" | "sms" | "reschedule" | "complete" | "snooze",
  completeAction?: ReturnType<typeof useCompleteAction>,
  updateAction?: ReturnType<typeof useUpdateAction>,
  onReschedule?: (event: CalendarEvent) => void,
) {
  if (action === "call") {
    navigate(getEventNavigation(event));
  } else if (action === "sms") {
    const params = new URLSearchParams();
    if (event.propertyId) params.set("property", event.propertyId);
    params.set("channel", "sms");
    navigate(`/communications?${params.toString()}`);
  } else if (action === "reschedule") {
    onReschedule?.(event);
  } else if (action === "complete") {
    const unifiedId = event.id.startsWith("ua-") ? event.id.slice(3) : null;
    if (unifiedId && completeAction) {
      completeAction.mutate(unifiedId);
      toast.success("Marked as complete", { description: `${event.title} — synced across all surfaces` });
    } else {
      toast.success("Marked as complete", { description: event.title });
    }
  } else if (action === "snooze") {
    const unifiedId = event.id.startsWith("ua-") ? event.id.slice(3) : null;
    if (unifiedId && updateAction) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      updateAction.mutate({
        id: unifiedId,
        status: "snoozed",
        snoozed_until: tomorrow.toISOString(),
      });
      toast.info("Snoozed until tomorrow 9 AM", { description: `${event.title} — removed from today's focus` });
    } else {
      toast.info("Snooze not available", { description: "Only unified actions can be snoozed" });
    }
  }
}

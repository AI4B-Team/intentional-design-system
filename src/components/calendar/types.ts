export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string | null;
  type: "appointment" | "followup" | "offer_deadline" | "closing" | "inspection";
  status: string;
  propertyId?: string;
  propertyAddress?: string;
  contactName?: string;
  meta?: Record<string, any>;
  isOverdue?: boolean;
  urgency?: "low" | "medium" | "high" | "critical";
  lastContactDays?: number;
  /** For Kanban: who is blocking progress */
  waitingOn?: "seller" | "me" | null;
}

export type ViewMode = "month" | "week" | "day";

export const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  appointment: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", label: "Appointment" },
  followup: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "Follow-Up" },
  offer_deadline: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", label: "Deadline" },
  closing: { bg: "bg-success/10", text: "text-success", dot: "bg-success", label: "Closing" },
  inspection: { bg: "bg-info/10", text: "text-info", dot: "bg-info", label: "Inspection" },
};

export const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border" },
  medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  high: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  critical: { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/40" },
};

export const EVENT_ICONS: Record<string, React.ElementType> = {
  appointment: undefined as any, // Set in component to avoid circular imports
  followup: undefined as any,
  offer_deadline: undefined as any,
  closing: undefined as any,
  inspection: undefined as any,
};

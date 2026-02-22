import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  differenceInDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  FileText,
  Home,
  AlertCircle,
  MessageSquare,
  CalendarClock,
  CheckCircle2,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { DailyAgenda } from "@/components/calendar/DailyAgenda";
import type { CalendarEvent } from "@/components/calendar/types";

type ViewMode = "month" | "week" | "day";

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  appointment: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", label: "Appointment" },
  followup: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Follow-Up" },
  offer_deadline: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", label: "Deadline" },
  closing: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Closing" },
  inspection: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Inspection" },
};

const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  medium: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
  critical: { bg: "bg-red-100", text: "text-red-800", border: "border-red-400" },
};

const EVENT_ICONS: Record<string, React.ElementType> = {
  appointment: CalendarIcon,
  followup: Phone,
  offer_deadline: FileText,
  closing: Home,
  inspection: AlertCircle,
};

function getUrgency(event: CalendarEvent): "low" | "medium" | "high" | "critical" {
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

function useCalendarEvents(currentDate: Date) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const rangeStart = startOfWeek(subMonths(monthStart, 1));
  const rangeEnd = endOfWeek(addMonths(monthEnd, 1));

  return useQuery({
    queryKey: ["calendar-events", format(rangeStart, "yyyy-MM-dd"), format(rangeEnd, "yyyy-MM-dd")],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const events: CalendarEvent[] = [];

      const { data: appointments } = await supabase
        .from("appointments")
        .select(`id, scheduled_time, appointment_type, status, notes, property_id, properties!inner(address, city, state)`)
        .gte("scheduled_time", rangeStart.toISOString())
        .lte("scheduled_time", rangeEnd.toISOString())
        .order("scheduled_time", { ascending: true });

      appointments?.forEach((apt) => {
        const prop = apt.properties as unknown as { address: string; city: string; state: string };
        events.push({
          id: apt.id,
          title: `${apt.appointment_type || "Appointment"} - ${prop.address}`,
          date: parseISO(apt.scheduled_time),
          time: format(parseISO(apt.scheduled_time), "h:mm a"),
          type: "appointment",
          status: apt.status || "scheduled",
          propertyId: apt.property_id,
          propertyAddress: `${prop.address}, ${prop.city}`,
        });
      });

      const { data: followups } = await supabase
        .from("calls")
        .select(`id, follow_up_date, follow_up_time, follow_up_notes, contact_name, property_id, properties(address, city), created_at`)
        .not("follow_up_date", "is", null)
        .gte("follow_up_date", format(rangeStart, "yyyy-MM-dd"))
        .lte("follow_up_date", format(rangeEnd, "yyyy-MM-dd"));

      followups?.forEach((f) => {
        const prop = f.properties as unknown as { address: string; city: string } | null;
        const d = parseISO(f.follow_up_date!);
        const isOverdue = d < new Date() && !isSameDay(d, new Date());
        const lastContactDays = f.created_at ? differenceInDays(new Date(), parseISO(f.created_at)) : undefined;
        events.push({
          id: `followup-${f.id}`,
          title: `Follow up: ${f.contact_name || prop?.address || "Unknown"}`,
          date: d,
          time: f.follow_up_time || null,
          type: "followup",
          status: isOverdue ? "overdue" : "pending",
          propertyId: f.property_id || undefined,
          propertyAddress: prop ? `${prop.address}, ${prop.city}` : undefined,
          contactName: f.contact_name || undefined,
          meta: { notes: f.follow_up_notes },
          isOverdue,
          lastContactDays,
        });
      });

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data: staleProps } = await supabase
        .from("properties")
        .select("id, address, city, state, updated_at")
        .eq("status", "contacted")
        .lt("updated_at", threeDaysAgo.toISOString())
        .limit(10);

      staleProps?.forEach((prop) => {
        const lastContactDays = differenceInDays(new Date(), parseISO(prop.updated_at));
        events.push({
          id: `stale-${prop.id}`,
          title: `Overdue: ${prop.address}`,
          date: new Date(),
          time: null,
          type: "followup",
          status: "overdue",
          propertyId: prop.id,
          propertyAddress: `${prop.address}, ${prop.city}`,
          isOverdue: true,
          lastContactDays,
        });
      });

      return events.map((e) => ({ ...e, urgency: getUrgency(e) })).sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    refetchInterval: 60000,
  });
}

// ─── Deep-link navigation ─────────────────────────────────
function getEventNavigation(event: CalendarEvent): string {
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
function handleQuickAction(navigate: ReturnType<typeof useNavigate>, event: CalendarEvent, action: "call" | "sms" | "reschedule" | "complete") {
  if (action === "call") {
    navigate(getEventNavigation(event));
  } else if (action === "sms") {
    const params = new URLSearchParams();
    if (event.propertyId) params.set("property", event.propertyId);
    params.set("channel", "sms");
    navigate(`/communications?${params.toString()}`);
  } else if (action === "reschedule") {
    toast.info("Reschedule coming soon", { description: "This will open a date picker" });
  } else if (action === "complete") {
    toast.success("Marked as complete", { description: event.title });
  }
}

// ─── Event Action Buttons ─────────────────────────────────
function EventActions({ event, navigate }: { event: CalendarEvent; navigate: ReturnType<typeof useNavigate> }) {
  const isActionable = event.isOverdue || event.type === "followup" || event.type === "offer_deadline";
  if (!isActionable) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-border mt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "call"); }}>
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Call</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "sms"); }}>
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">SMS</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "reschedule"); }}>
              <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Reschedule</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "complete"); }}>
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Complete</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

// ─── AI Context Snippet ───────────────────────────────────
function AIContext({ event }: { event: CalendarEvent }) {
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

// ─── Main Calendar Component ──────────────────────────────
export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teamMode, setTeamMode] = useState(false);

  const { data: events = [] } = useCalendarEvents(currentDate);

  const goToPrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const goToNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const calendarDays = useMemo(() => {
    const s = startOfWeek(startOfMonth(currentDate));
    const e = endOfWeek(endOfMonth(currentDate));
    const days: Date[] = [];
    let day = s;
    while (day <= e) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentDate]);

  const selectedDateEvents = useMemo(() => events.filter((e) => isSameDay(e.date, selectedDate)), [events, selectedDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = format(e.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  const todayEvents = useMemo(() => events.filter((e) => isToday(e.date)), [events]);
  const upcomingCount = useMemo(() => events.filter((e) => e.date >= new Date()).length, [events]);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Page Title */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Calendar</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayEvents.length} events today · {upcomingCount} upcoming
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate("/power-hour")} className="text-xs gap-1.5 bg-primary hover:bg-primary/90">
              <Zap className="h-3 w-3" />
              Start Power Hour
            </Button>
            <Button size="sm" variant={teamMode ? "default" : "outline"} onClick={() => setTeamMode(!teamMode)} className="text-xs gap-1.5">
              <Users className="h-3 w-3" />
              {teamMode ? "Team" : "Investor"}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-foreground z-[200]">
                  <p className="text-xs">{sidebarOpen ? "Collapse Panel" : "Expand Panel"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* AI Daily Agenda — Above all controls */}
        <DailyAgenda events={events} teamMode={teamMode} />

        {/* Transition divider */}
        <div className="flex items-center gap-3 px-6 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">After today's execution…</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <Button key={v} size="sm" variant={viewMode === v ? "default" : "secondary"}
                onClick={() => setViewMode(v)} className="capitalize text-xs">
                {v}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" onClick={goToToday} className="font-semibold">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              Today
            </Button>
            <Button size="icon" variant="ghost" onClick={goToPrev}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">
              {viewMode === "day"
                ? format(currentDate, "EEEE, MMM d, yyyy")
                : viewMode === "week"
                  ? `Week of ${format(startOfWeek(currentDate), "MMM d")}`
                  : format(currentDate, "MMMM yyyy")}
            </span>
            <Button size="icon" variant="ghost" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar grid — slightly reduced contrast */}
          <div className="flex-1 flex flex-col overflow-auto p-4 opacity-90">
            <div className="grid grid-cols-7 gap-px mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px flex-1 bg-border rounded-lg overflow-hidden">
              {calendarDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const hasOverdue = dayEvents.some((e) => e.isOverdue);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "bg-card p-1.5 min-h-[80px] text-left transition-colors hover:bg-muted/50 flex flex-col",
                      !isCurrentMonth && "bg-muted/20",
                      isSelected && "ring-2 ring-primary ring-inset",
                      hasOverdue && isCurrentDay && "bg-red-50/50",
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-0.5",
                      isCurrentDay && "bg-primary text-primary-foreground",
                      !isCurrentDay && !isCurrentMonth && "text-muted-foreground/50",
                      !isCurrentDay && isCurrentMonth && "text-foreground",
                    )}>
                      {format(day, "d")}
                    </span>
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                        const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                        return (
                          <div key={evt.id} className={cn(
                            "text-[9px] leading-tight px-1 py-0.5 rounded truncate",
                            urgencyColor ? cn(urgencyColor.bg, urgencyColor.text) : cn(colors.bg, colors.text),
                          )}>
                            {evt.time ? `${evt.time} ` : ""}{evt.title.split(" - ")[0]}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar — Fixed Order: Context → Signal → Directive → Events → Notes */}
          {sidebarOpen && (
            <div className="w-[320px] border-l border-border bg-card overflow-y-auto hidden lg:block">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">{format(selectedDate, "EEEE, MMMM d")}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
                </p>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">You're clear for this day.</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Want to generate outreach?</p>
                  <Button size="sm" variant="secondary" className="mt-3 text-xs" onClick={() => navigate("/intel")}>
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Find Opportunities
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* 1. Contact / Deal Context */}
                  {selectedDateEvents.map((evt) => {
                    const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                    const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                    const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;

                    return (
                      <div
                        key={evt.id}
                        className={cn(
                          "border-b border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors",
                          urgencyColor ? urgencyColor.bg : "",
                        )}
                        onClick={() => navigate(getEventNavigation(evt))}
                      >
                        {/* Context: Name, Address, Type */}
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                            urgencyColor ? urgencyColor.bg : colors.bg,
                          )}>
                            <Icon className={cn("h-3.5 w-3.5", urgencyColor ? urgencyColor.text : colors.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{evt.contactName || evt.title.split(" - ")[0]}</p>
                            {evt.propertyAddress && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground truncate">{evt.propertyAddress}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="outline" className={cn(
                                "text-[9px] border",
                                urgencyColor ? cn(urgencyColor.bg, urgencyColor.text, urgencyColor.border) : cn(colors.bg, colors.text),
                              )}>
                                {evt.isOverdue ? "Overdue" : colors.label}
                              </Badge>
                              {evt.time && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" /> {evt.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. AI Priority Signal */}
                        {(evt.urgency && evt.urgency !== "low") && (
                          <div className="mt-2 px-2 py-1.5 rounded bg-muted/50 flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">Risk:</span>
                                <Badge variant="outline" className={cn(
                                  "text-[9px] border",
                                  URGENCY_COLORS[evt.urgency!].bg,
                                  URGENCY_COLORS[evt.urgency!].text,
                                  URGENCY_COLORS[evt.urgency!].border,
                                )}>
                                  {evt.urgency === "critical" ? "🔥 Critical" : evt.urgency === "high" ? "High" : "Medium"}
                                </Badge>
                                {evt.lastContactDays !== undefined && (
                                  <span className="text-[10px] text-muted-foreground">
                                    · {evt.lastContactDays}d since contact
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. AI Directive — single sentence + CTA */}
                        <AIContext event={evt} />

                        {/* 4. Actions */}
                        <EventActions event={evt} navigate={navigate} />
                      </div>
                    );
                  })}

                  {/* 5. AI Summary / Notes — collapsible */}
                  {selectedDateEvents.some((e) => e.meta?.notes) && (
                    <details className="border-b border-border">
                      <summary className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/30">
                        AI Notes
                      </summary>
                      <div className="px-3 pb-3 space-y-1.5">
                        {selectedDateEvents.filter((e) => e.meta?.notes).map((evt) => (
                          <div key={`note-${evt.id}`} className="text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1.5">
                            <span className="font-medium text-foreground">{evt.contactName || evt.propertyAddress}: </span>
                            {evt.meta!.notes}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              <div className="p-4 border-t border-border mt-auto">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Types</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                      <span className="text-[10px] text-muted-foreground capitalize">{colors.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

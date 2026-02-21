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
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  FileText,
  Users,
  Home,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Unified calendar event type
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string | null;
  type: "appointment" | "followup" | "offer_deadline" | "closing" | "inspection";
  status: string;
  propertyId?: string;
  propertyAddress?: string;
  meta?: Record<string, any>;
}

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  appointment: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", label: "Appointment" },
  followup: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "Followup" },
  offer_deadline: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", label: "Overdue" },
  closing: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent", label: "Closing" },
  inspection: { bg: "bg-info/10", text: "text-info", dot: "bg-info", label: "Inspection" },
};

const EVENT_ICONS: Record<string, React.ElementType> = {
  appointment: CalendarIcon,
  followup: Phone,
  offer_deadline: FileText,
  closing: Home,
  inspection: AlertCircle,
};

type ViewMode = "month" | "week" | "day";

function useCalendarEvents(currentDate: Date) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // Fetch a wider range for week view edges
  const rangeStart = startOfWeek(subMonths(monthStart, 1));
  const rangeEnd = endOfWeek(addMonths(monthEnd, 1));

  return useQuery({
    queryKey: ["calendar-events", format(rangeStart, "yyyy-MM-dd"), format(rangeEnd, "yyyy-MM-dd")],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const events: CalendarEvent[] = [];

      // 1. Appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id, scheduled_time, appointment_type, status, notes,
          property_id, properties!inner(address, city, state)
        `)
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

      // 2. Follow-ups from calls
      const { data: followups } = await supabase
        .from("calls")
        .select(`
          id, follow_up_date, follow_up_time, follow_up_notes, contact_name,
          property_id, properties(address, city)
        `)
        .not("follow_up_date", "is", null)
        .gte("follow_up_date", format(rangeStart, "yyyy-MM-dd"))
        .lte("follow_up_date", format(rangeEnd, "yyyy-MM-dd"));

      followups?.forEach((f) => {
        const prop = f.properties as unknown as { address: string; city: string } | null;
        const d = parseISO(f.follow_up_date!);
        events.push({
          id: `followup-${f.id}`,
          title: `Follow up: ${f.contact_name || prop?.address || "Unknown"}`,
          date: d,
          time: f.follow_up_time || null,
          type: "followup",
          status: "pending",
          propertyId: f.property_id || undefined,
          propertyAddress: prop ? `${prop.address}, ${prop.city}` : undefined,
          meta: { notes: f.follow_up_notes },
        });
      });

      // 3. Properties needing follow-up (contacted, stale 3+ days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data: staleProps } = await supabase
        .from("properties")
        .select("id, address, city, state, updated_at")
        .eq("status", "contacted")
        .lt("updated_at", threeDaysAgo.toISOString())
        .limit(10);

      staleProps?.forEach((prop) => {
        events.push({
          id: `stale-${prop.id}`,
          title: `Overdue follow-up: ${prop.address}`,
          date: new Date(), // Show today
          time: null,
          type: "followup",
          status: "overdue",
          propertyId: prop.id,
          propertyAddress: `${prop.address}, ${prop.city}`,
        });
      });

      return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    refetchInterval: 60000,
  });
}

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const { data: events = [], isLoading } = useCalendarEvents(currentDate);

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

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart_ = startOfMonth(currentDate);
    const monthEnd_ = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart_);
    const endDate = endOfWeek(monthEnd_);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    return events.filter((e) => isSameDay(e.date, selectedDate));
  }, [events, selectedDate]);

  // Events grouped by date for dots
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = format(e.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Stats
  const todayEvents = useMemo(() => events.filter((e) => isToday(e.date)), [events]);
  const upcomingCount = useMemo(() => events.filter((e) => e.date >= new Date()).length, [events]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-foreground">Calendar</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayEvents.length} events today · {upcomingCount} upcoming
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggles */}
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <Button key={v} size="sm" variant={viewMode === v ? "default" : "secondary"}
                onClick={() => setViewMode(v)} className="capitalize text-xs">
                {v}
              </Button>
            ))}
            <div className="w-px h-6 bg-border mx-1" />
            <Button size="sm" variant="secondary" onClick={goToToday}>Today</Button>
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
          {/* Calendar grid */}
          <div className="flex-1 flex flex-col overflow-auto p-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px flex-1 bg-border rounded-lg overflow-hidden">
              {calendarDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "bg-card p-1.5 min-h-[80px] text-left transition-colors hover:bg-muted/50 flex flex-col",
                      !isCurrentMonth && "bg-muted/20",
                      isSelected && "ring-2 ring-primary ring-inset",
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
                    {/* Event dots / previews */}
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                        return (
                          <div key={evt.id} className={cn("text-[9px] leading-tight px-1 py-0.5 rounded truncate", colors.bg, colors.text)}>
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

          {/* Sidebar - Selected day events */}
          <div className="w-[320px] border-l border-border bg-card overflow-y-auto hidden lg:block">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
              </p>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="p-6 text-center">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No events scheduled</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Click a day with events to see details</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {selectedDateEvents.map((evt) => {
                  const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                  const Icon = EVENT_ICONS[evt.type] || CalendarIcon;

                  return (
                    <div
                      key={evt.id}
                      className={cn(
                        "rounded-lg border border-border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors",
                      )}
                      onClick={() => evt.propertyId && navigate(`/properties/${evt.propertyId}`)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5", colors.bg)}>
                          <Icon className={cn("h-3.5 w-3.5", colors.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{evt.title}</p>
                          {evt.time && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{evt.time}</span>
                            </div>
                          )}
                          {evt.propertyAddress && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground truncate">{evt.propertyAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn("text-[9px] border", colors.bg, colors.text)}>
                          {colors.label}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          {evt.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
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
        </div>
      </div>
    </AppLayout>
  );
}

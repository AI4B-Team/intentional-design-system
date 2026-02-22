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
  Search,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  List,
  Kanban,
  LayoutGrid,
  Rss,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  low: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border" },
  medium: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
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
            <Button size="sm" className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "call"); }}>
              <Phone className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Call Now</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "sms"); }}>
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">SMS</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, event, "reschedule"); }}>
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
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
type CalendarViewTab = "calendar" | "plan" | "kanban" | "grid" | "feed";

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teamMode, setTeamMode] = useState(false);
  const [viewTab, setViewTab] = useState<CalendarViewTab>("calendar");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: fetchedEvents = [] } = useCalendarEvents(currentDate);

  // Always merge demo data with real data so every column has content for preview
  const events = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const demo: CalendarEvent[] = [
      // Overdue
      {
        id: "demo-overdue-1", title: "Follow up: Maria Santos", date: addDays(today, -5), time: null,
        type: "followup", status: "overdue", propertyAddress: "890 Pine Road, Georgetown",
        contactName: "Maria Santos", isOverdue: true, lastContactDays: 5, urgency: "high",
        meta: { notes: "Seller motivated, discussed 85% offer. Needs follow-up on inspection waiver." },
      },
      {
        id: "demo-overdue-2", title: "Follow up: James Chen", date: addDays(today, -3), time: null,
        type: "followup", status: "overdue", propertyAddress: "234 Maple Drive, Cedar Park",
        contactName: "James Chen", isOverdue: true, lastContactDays: 3, urgency: "medium",
        meta: { notes: "Initial offer sent. Waiting for counter." },
      },
      {
        id: "demo-overdue-3", title: "Overdue: 456 Oak Lane", date: addDays(today, -8), time: null,
        type: "followup", status: "overdue", propertyAddress: "456 Oak Lane, Round Rock",
        contactName: "Patricia Williams", isOverdue: true, lastContactDays: 8, urgency: "critical",
      },
      // Today
      {
        id: "demo-today-1", title: "Walkthrough - 1200 Congress Ave", date: today, time: "10:00 AM",
        type: "appointment", status: "scheduled", propertyAddress: "1200 Congress Ave, Austin",
        contactName: "Robert Davis", urgency: "low",
      },
      {
        id: "demo-today-2", title: "Follow up: Lisa Park", date: today, time: "2:00 PM",
        type: "followup", status: "pending", propertyAddress: "567 Elm Street, Pflugerville",
        contactName: "Lisa Park", lastContactDays: 1, urgency: "low",
        meta: { notes: "Warm lead — asked about closing timeline." },
      },
      {
        id: "demo-today-3", title: "Closing Call - 789 Birch Ct", date: today, time: "4:30 PM",
        type: "closing", status: "scheduled", propertyAddress: "789 Birch Court, Leander",
        contactName: "Michael Torres", urgency: "low",
      },
      // Upcoming (future non-blocked)
      {
        id: "demo-upcoming-1", title: "Showing - 450 Willow Way", date: addDays(today, 1), time: "11:00 AM",
        type: "appointment", status: "scheduled", propertyAddress: "450 Willow Way, Cedar Park",
        contactName: "Nancy Johnson", urgency: "low",
      },
      {
        id: "demo-upcoming-2", title: "Offer Deadline - 1500 Lamar", date: addDays(today, 1), time: "5:00 PM",
        type: "offer_deadline", status: "pending", propertyAddress: "1500 Lamar Blvd, Austin",
        contactName: "Sandra Lee", urgency: "high",
      },
      {
        id: "demo-upcoming-3", title: "Closing - 2100 Lake Travis", date: addDays(today, 4), time: "10:00 AM",
        type: "closing", status: "scheduled", propertyAddress: "2100 Lake Travis Dr, Lakeway",
        contactName: "Angela Martinez", urgency: "low",
      },
      {
        id: "demo-upcoming-4", title: "Title Review - 345 Heritage", date: addDays(today, 5), time: "1:00 PM",
        type: "inspection", status: "scheduled", propertyAddress: "345 Heritage Lane, Dripping Springs",
        contactName: "Tom Harris", urgency: "low",
      },
      // Waiting on Seller
      {
        id: "demo-ws-1", title: "Follow up: Karen White", date: addDays(today, 2), time: null,
        type: "followup", status: "pending", propertyAddress: "321 Sunset Blvd, Georgetown",
        contactName: "Karen White", lastContactDays: 2, urgency: "low", waitingOn: "seller",
        meta: { notes: "Sent counter-offer, awaiting seller response." },
      },
      {
        id: "demo-ws-2", title: "Follow up: David Miller", date: addDays(today, 3), time: null,
        type: "followup", status: "pending", propertyAddress: "654 River Road, Bastrop",
        contactName: "David Miller", lastContactDays: 4, urgency: "medium", waitingOn: "seller",
        meta: { notes: "Seller reviewing inspection report." },
      },
      {
        id: "demo-ws-3", title: "Inspection Due - 890 Pine Rd", date: addDays(today, 2), time: null,
        type: "offer_deadline", status: "pending", propertyAddress: "890 Pine Road, Georgetown",
        contactName: "Maria Santos", urgency: "medium", waitingOn: "seller",
        meta: { notes: "Seller scheduling inspector access." },
      },
      // Waiting on Me
      {
        id: "demo-wm-1", title: "Send Comps - 900 Main St", date: addDays(today, 1), time: null,
        type: "followup", status: "pending", propertyAddress: "900 Main Street, Round Rock",
        contactName: "Brian Thompson", urgency: "medium", waitingOn: "me",
        meta: { notes: "Need to pull comps and send offer letter." },
      },
      {
        id: "demo-wm-2", title: "Listing Presentation Prep", date: addDays(today, 2), time: null,
        type: "appointment", status: "pending", propertyAddress: "1100 Burnet Rd, Austin",
        contactName: "Rachel Kim", urgency: "low", waitingOn: "me",
        meta: { notes: "Prepare CMA and listing agreement." },
      },
    ];
    // Merge: real events + demo events (dedup by id)
    const realIds = new Set(fetchedEvents.map((e) => e.id));
    const merged = [...fetchedEvents, ...demo.filter((d) => !realIds.has(d.id))];
    return merged.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [fetchedEvents]);

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

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeFilters.length > 0) {
      filtered = filtered.filter((e) => activeFilters.includes(e.type));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.propertyAddress?.toLowerCase().includes(q) ||
        e.contactName?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [events, activeFilters, searchQuery]);

  const filteredEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((e) => {
      const key = format(e.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [filteredEvents]);

  const toggleFilter = (type: string) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };

  const handleExport = () => {
    const lines = ["Subject,Start Date,Start Time,Type,Address"];
    filteredEvents.forEach((e) => {
      lines.push(`"${e.title}","${format(e.date, "yyyy-MM-dd")}","${e.time || ""}","${e.type}","${e.propertyAddress || ""}"`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar-${format(currentDate, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar exported", { description: `${filteredEvents.length} events exported as CSV` });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden bg-muted/30">
        {/* Title and action buttons */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-white border-b border-border">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Calendar</h1>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <Button size="sm" onClick={() => navigate("/communications?mode=power-hour")} className="text-xs gap-1.5 bg-primary hover:bg-primary/90 h-8 rounded-lg">
                <Zap className="h-3.5 w-3.5" />
                Start Power Hour
              </Button>
              <span className="text-[9px] text-muted-foreground/60 mt-0.5 italic">AI-curated calls with the highest close probability</span>
            </div>
            <Button size="sm" variant={teamMode ? "default" : "outline"} onClick={() => setTeamMode(!teamMode)} className="text-xs gap-1.5 h-8 rounded-lg">
              <Users className="h-3.5 w-3.5" />
              {teamMode ? "Team" : "Solo"}
            </Button>
          </div>
        </div>

        {/* AI Daily Agenda — Above all controls */}
        <DailyAgenda events={events} teamMode={teamMode} />

        {/* Transition divider */}
        <div className="flex items-center gap-4 px-6 py-2.5 bg-white">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">After today's execution, tomorrow gets easier.</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Row 1: View tabs + action buttons */}
        <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-border/60">
          <div className="flex items-center gap-1.5">
            {([
              { id: "calendar" as CalendarViewTab, icon: CalendarIcon, label: "Calendar" },
              { id: "plan" as CalendarViewTab, icon: List, label: "Plan" },
              { id: "kanban" as CalendarViewTab, icon: Kanban, label: "Kanban" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all",
                  viewTab === tab.id
                    ? "bg-white text-foreground shadow-sm border-border"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-border/50 hover:bg-muted/30"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-48 text-xs rounded-lg"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setSearchOpen(true)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Search</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Popover>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", activeFilters.length > 0 && "text-primary")}>
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Filter</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent align="end" className="bg-white w-48 p-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Event Types</p>
                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs hover:bg-muted/50 transition-colors",
                      activeFilters.includes(type) && "bg-primary/5"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                    <span className="flex-1 text-left">{colors.label}</span>
                    {activeFilters.includes(type) && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
                {activeFilters.length > 0 && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => setActiveFilters([])} className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left">
                      Clear filters
                    </button>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Export CSV</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">More</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="bg-white w-48">
                <DropdownMenuItem onClick={() => navigate("/communications?channel=calls&filter=needs_action")} className="text-xs">
                  <Phone className="h-3.5 w-3.5 mr-2" /> Calls To Make
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/intel")} className="text-xs">
                  <Sparkles className="h-3.5 w-3.5 mr-2" /> Find Opportunities
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport} className="text-xs">
                  <Download className="h-3.5 w-3.5 mr-2" /> Export Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-5 bg-border mx-0.5" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

        {/* Row 2: View mode + date navigation */}
        <div className="relative flex items-center justify-center px-6 py-2 bg-muted/20 border-b border-border/40">
          {/* Left: View mode + Today — absolutely positioned */}
          <div className="absolute left-6 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs capitalize h-7 rounded-md border-border/60 bg-white hover:bg-muted/30 text-foreground font-medium px-3">
                  <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                  {viewMode}
                  <ChevronDown className="h-3 w-3 opacity-40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white w-36">
                {(["day", "week", "month"] as ViewMode[]).map((v) => (
                  <DropdownMenuItem key={v} onClick={() => setViewMode(v)} className="capitalize text-xs gap-2">
                    {v === viewMode && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    {v !== viewMode && <div className="w-3" />}
                    {v}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={goToToday} className="h-7 text-xs rounded-md border-border/60 bg-white hover:bg-primary/5 text-primary font-medium px-3 gap-1.5">
                    <CalendarIcon className="h-3 w-3" />
                    Today
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Jump to today</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center: Date navigation */}
          <div className="flex items-center gap-1.5">
            <Button size="icon" variant="ghost" onClick={goToPrev} className="h-7 w-7 rounded-md hover:bg-white"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Button>
            <span className="text-sm font-semibold text-foreground min-w-[180px] text-center tracking-tight">
              {viewMode === "day"
                ? format(currentDate, "EEEE, MMM d, yyyy")
                : viewMode === "week"
                  ? `Week of ${format(startOfWeek(currentDate), "MMM d")}`
                  : format(currentDate, "MMMM yyyy")}
            </span>
            <Button size="icon" variant="ghost" onClick={goToNext} className="h-7 w-7 rounded-md hover:bg-white"><ChevronRight className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        </div>

        {/* Active filters indicator */}
        {(activeFilters.length > 0 || searchQuery) && (
          <div className="flex items-center gap-2 px-6 py-1.5 bg-white border-b border-border">
            {activeFilters.map((f) => (
              <Badge key={f} variant="secondary" className="text-[10px] gap-1 rounded-md">
                <div className={cn("w-1.5 h-1.5 rounded-full", EVENT_COLORS[f]?.dot)} />
                {EVENT_COLORS[f]?.label}
                <button onClick={() => toggleFilter(f)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="text-[10px] gap-1 rounded-md">
                Search: "{searchQuery}"
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-auto p-5 bg-white">
            {viewTab === "calendar" && viewMode === "month" && (
              <>
                {/* Month Grid Header */}
                <div className="grid grid-cols-7 mb-2">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-2">{d}</div>
                  ))}
                </div>
                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-px flex-1 bg-border/60 rounded-xl shadow-sm overflow-visible">
                  {calendarDays.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayEvents = filteredEventsByDate.get(dateKey) || [];
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    const hasOverdue = dayEvents.some((e) => e.isOverdue);
                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "bg-white p-2 min-h-[90px] text-left transition-all hover:bg-muted/30 flex flex-col overflow-hidden",
                          !isCurrentMonth && "bg-muted/10",
                          isSelected && "relative z-10 shadow-[0_0_0_2px_hsl(var(--primary))] rounded-md bg-primary/[0.02]",
                          hasOverdue && isCurrentDay && "bg-red-50/30",
                        )}
                      >
                        <span className={cn(
                          "text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                          isCurrentDay && "bg-primary text-primary-foreground font-semibold",
                          !isCurrentDay && !isCurrentMonth && "text-muted-foreground/40",
                          !isCurrentDay && isCurrentMonth && "text-foreground",
                        )}>
                          {format(day, "d")}
                        </span>
                        <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                          {(() => {
                            const overdueEvents = dayEvents.filter((e) => e.isOverdue);
                            const normalEvents = dayEvents.filter((e) => !e.isOverdue);
                            const items: React.ReactNode[] = [];

                            if (overdueEvents.length > 1) {
                              items.push(
                                <div key="overdue-summary" className="text-[9px] leading-tight px-1.5 py-0.5 rounded-md truncate bg-red-50 text-red-700 font-medium">
                                  {overdueEvents.length} Overdue
                                </div>
                              );
                            } else if (overdueEvents.length === 1) {
                              const evt = overdueEvents[0];
                              const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                              items.push(
                                <div key={evt.id} className={cn("text-[9px] leading-tight px-1.5 py-0.5 rounded-md truncate", urgencyColor ? cn(urgencyColor.bg, urgencyColor.text) : "bg-red-50 text-red-700")}>
                                  {evt.title.split(" - ")[0]}
                                </div>
                              );
                            }

                            const slotsLeft = 3 - items.length;
                            normalEvents.slice(0, slotsLeft).forEach((evt) => {
                              const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                              items.push(
                                <div key={evt.id} className={cn("text-[9px] leading-tight px-1.5 py-0.5 rounded-md truncate", colors.bg, colors.text)}>
                                  {evt.time ? `${evt.time} ` : ""}{evt.title.split(" - ")[0]}
                                </div>
                              );
                            });

                            const remaining = dayEvents.length - (overdueEvents.length > 1 ? 1 : overdueEvents.length) - Math.min(normalEvents.length, slotsLeft);
                            if (remaining > 0) {
                              items.push(<span key="more" className="text-[9px] text-muted-foreground pl-1.5">+{remaining} more</span>);
                            }

                            return items;
                          })()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {viewTab === "calendar" && viewMode === "week" && (() => {
              const weekStart = startOfWeek(currentDate);
              const weekDaysArr = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
              const hours = Array.from({ length: 24 }, (_, i) => i);
              return (
                <>
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px mb-2">
                    <div />
                    {weekDaysArr.map((day) => (
                      <div key={day.toISOString()} className="text-center py-2">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{format(day, "EEE")}</div>
                        <button
                          onClick={() => { setSelectedDate(day); setViewMode("day"); }}
                          className={cn(
                            "text-sm font-medium w-8 h-8 rounded-full mx-auto flex items-center justify-center mt-0.5 transition-all",
                            isToday(day) && "bg-primary text-primary-foreground",
                            isSameDay(day, selectedDate) && !isToday(day) && "ring-2 ring-primary",
                          )}
                        >
                          {format(day, "d")}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-auto border border-border/60 rounded-xl shadow-sm">
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-border/60">
                      {hours.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="bg-white p-1 text-[10px] text-muted-foreground text-right pr-2 h-12 flex items-start justify-end pt-1">
                            {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                          </div>
                          {weekDaysArr.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const hourEvents = (filteredEventsByDate.get(dateKey) || []).filter((evt) => {
                              if (!evt.time) return hour === 9;
                              const eventHour = parseInt(evt.time.split(":")[0]);
                              return eventHour === hour;
                            });
                            return (
                              <button
                                key={`${dateKey}-${hour}`}
                                onClick={() => setSelectedDate(day)}
                                className="bg-white h-12 relative hover:bg-muted/20 transition-colors"
                              >
                                {hourEvents.map((evt) => {
                                  const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                                  return (
                                    <div
                                      key={evt.id}
                                      onClick={(e) => { e.stopPropagation(); navigate(getEventNavigation(evt)); }}
                                      className={cn("absolute inset-x-0.5 top-0.5 text-[9px] px-1.5 py-0.5 rounded-md truncate cursor-pointer", colors.bg, colors.text)}
                                    >
                                      {evt.title.split(" - ")[0]}
                                    </div>
                                  );
                                })}
                              </button>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {viewTab === "calendar" && viewMode === "day" && (() => {
              const dateKey = format(currentDate, "yyyy-MM-dd");
              const dayEvts = filteredEventsByDate.get(dateKey) || [];
              const hours = Array.from({ length: 24 }, (_, i) => i);
              return (
                <div className="flex-1 overflow-auto border border-border/60 rounded-xl shadow-sm">
                  <div className="grid grid-cols-[60px_1fr] gap-px bg-border/60">
                    {hours.map((hour) => {
                      const hourEvents = dayEvts.filter((evt) => {
                        if (!evt.time) return hour === 9;
                        const eventHour = parseInt(evt.time.split(":")[0]);
                        return eventHour === hour;
                      });
                      return (
                        <React.Fragment key={hour}>
                          <div className="bg-white p-1 text-[10px] text-muted-foreground text-right pr-2 h-14 flex items-start justify-end pt-1">
                            {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                          </div>
                          <div className="bg-white h-14 relative hover:bg-muted/20 transition-colors">
                            {hourEvents.map((evt) => {
                              const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                              return (
                                <div
                                  key={evt.id}
                                  onClick={() => navigate(getEventNavigation(evt))}
                                  className={cn("absolute inset-x-1 top-0.5 text-xs px-2.5 py-1.5 rounded-md cursor-pointer", colors.bg, colors.text)}
                                >
                                  <span className="font-medium">{evt.title}</span>
                                  {evt.time && <span className="ml-2 opacity-75">{evt.time}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {viewTab === "plan" && (
              <div className="space-y-5">
                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground">No events found</p>
                  </div>
                ) : (
                  (() => {
                    const grouped = new Map<string, typeof filteredEvents>();
                    filteredEvents.forEach((evt) => {
                      const key = format(evt.date, "yyyy-MM-dd");
                      if (!grouped.has(key)) grouped.set(key, []);
                      grouped.get(key)!.push(evt);
                    });
                    return Array.from(grouped.entries()).map(([dateKey, dayEvts]) => (
                      <div key={dateKey}>
                        <div className="flex items-center gap-3 mb-2.5">
                          <span className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-md",
                            isToday(parseISO(dateKey)) ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted/50"
                          )}>
                            {isToday(parseISO(dateKey)) ? "Today" : format(parseISO(dateKey), "EEEE, MMM d")}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] text-muted-foreground">{dayEvts.length} event{dayEvts.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="space-y-1.5 pl-3 border-l-2 border-border/60 ml-3">
                          {dayEvts.map((evt) => {
                            const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                            const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                            const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                            return (
                              <div
                                key={evt.id}
                                onClick={() => navigate(getEventNavigation(evt))}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-all"
                              >
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", evt.isOverdue ? "bg-red-50" : urgencyColor ? urgencyColor.bg : colors.bg)}>
                                  <Icon className={cn("h-4 w-4", evt.isOverdue ? "text-red-600" : urgencyColor ? urgencyColor.text : colors.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{evt.title}</p>
                                  {evt.propertyAddress && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                      <MapPin className="h-2.5 w-2.5 shrink-0" /> {evt.propertyAddress}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {evt.time && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                      <Clock className="h-2.5 w-2.5" /> {evt.time}
                                    </span>
                                  )}
                                  <Badge variant="outline" className={cn(
                                    "text-[9px] border rounded-md",
                                    evt.isOverdue ? "bg-red-50 text-red-700 border-red-200" : urgencyColor ? cn(urgencyColor.bg, urgencyColor.text, urgencyColor.border) : cn(colors.bg, colors.text),
                                  )}>
                                    {evt.isOverdue ? "Overdue" : colors.label}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            )}

            {viewTab === "kanban" && (() => {
              // Execution-oriented columns
              const now = new Date();
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const weekEnd = addDays(todayStart, 7);

              const columns: { id: string; label: string; dotColor: string; emptyMsg: string; events: CalendarEvent[] }[] = [
                {
                  id: "overdue",
                  label: "Overdue",
                  dotColor: "bg-red-500",
                  emptyMsg: "No overdue — you're clean",
                  events: filteredEvents.filter((e) => e.isOverdue),
                },
                {
                  id: "today",
                  label: "Today",
                  dotColor: "bg-primary",
                  emptyMsg: "Nothing scheduled today",
                  events: filteredEvents.filter((e) => !e.isOverdue && isSameDay(e.date, now) && !e.waitingOn),
                },
                {
                  id: "upcoming",
                  label: "Upcoming",
                  dotColor: "bg-muted-foreground",
                  emptyMsg: "No upcoming tasks",
                  events: filteredEvents.filter((e) => !e.isOverdue && !isSameDay(e.date, now) && !e.waitingOn && e.date >= todayStart && e.date <= weekEnd),
                },
                {
                  id: "waiting_seller",
                  label: "Waiting on Seller",
                  dotColor: "bg-amber-400",
                  emptyMsg: "Nothing blocked by sellers",
                  events: filteredEvents.filter((e) => !e.isOverdue && e.waitingOn === "seller"),
                },
                {
                  id: "waiting_me",
                  label: "Waiting on Me",
                  dotColor: "bg-blue-500",
                  emptyMsg: "You're caught up",
                  events: filteredEvents.filter((e) => !e.isOverdue && e.waitingOn === "me"),
                },
              ];

              return (
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
                  {columns.map((col) => (
                    <div key={col.id} className="flex-shrink-0 w-64 flex flex-col">
                      {/* Column header */}
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className={cn("w-2 h-2 rounded-full", col.dotColor)} />
                        <span className="text-xs font-semibold text-foreground">{col.label}</span>
                        <Badge variant="secondary" className="text-[10px] ml-auto rounded-md h-5 px-1.5">{col.events.length}</Badge>
                      </div>

                      {/* Column body */}
                      <div className={cn(
                        "flex-1 space-y-1.5 min-h-[200px] p-2 rounded-xl border",
                        col.id === "overdue" && col.events.length > 0
                          ? "bg-red-50/30 border-red-200/50"
                          : "bg-muted/15 border-border/40",
                      )}>
                        {col.events.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10">
                            <p className="text-[10px] text-muted-foreground/60">{col.emptyMsg}</p>
                          </div>
                        ) : (
                          col.events.map((evt) => {
                            const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                            const isAtRisk = !evt.isOverdue && evt.urgency && evt.urgency !== "low";
                            const isOnTrack = !evt.isOverdue && (!evt.urgency || evt.urgency === "low");

                            return (
                              <div
                                key={evt.id}
                                className={cn(
                                  "group rounded-lg bg-white border border-border/60 hover:shadow-md cursor-pointer transition-all overflow-hidden",
                                  evt.isOverdue && "border-l-[3px] border-l-red-400",
                                  isAtRisk && "border-l-[3px] border-l-amber-300",
                                )}
                              >
                                {/* Compact card content */}
                                <div className="px-2.5 py-2" onClick={() => navigate(getEventNavigation(evt))}>
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                                      evt.isOverdue ? "bg-red-50" : isAtRisk ? "bg-amber-50" : "bg-muted/40",
                                    )}>
                                      <Icon className={cn("h-3 w-3", evt.isOverdue ? "text-red-600" : isAtRisk ? "text-amber-600" : "text-muted-foreground")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-semibold text-foreground truncate">
                                        {evt.contactName || evt.title.split(" - ")[0]}
                                      </p>
                                    </div>
                                    {/* Status indicators — minimal */}
                                    {evt.isOverdue && (
                                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Overdue" />
                                    )}
                                    {isAtRisk && !evt.isOverdue && (
                                      <Badge variant="outline" className="text-[7px] px-1 py-0 border-amber-200 text-amber-600 bg-transparent font-medium">
                                        At Risk
                                      </Badge>
                                    )}
                                    {isOnTrack && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="On Track" />
                                    )}
                                  </div>

                                  {/* Secondary metadata — collapsed until hover */}
                                  <div className="hidden group-hover:flex items-center gap-2 mt-1 ml-8 flex-wrap">
                                    {evt.propertyAddress && (
                                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate max-w-[160px]">
                                        <MapPin className="h-2 w-2 shrink-0" /> {evt.propertyAddress}
                                      </span>
                                    )}
                                    {evt.lastContactDays !== undefined && (
                                      <span className="text-[9px] text-muted-foreground">
                                        {evt.lastContactDays}d ago
                                      </span>
                                    )}
                                    {evt.time && (
                                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                        <Clock className="h-2 w-2" /> {evt.time}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Quick actions — always visible, Call dominant */}
                                <div className="flex items-center border-t border-border/30">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, evt, "call"); }}
                                          className="flex-[2] flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                                        >
                                          <Phone className="h-3 w-3" />
                                          Call
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Call Now</p></TooltipContent>
                                    </Tooltip>
                                    <div className="w-px h-3.5 bg-border/30" />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, evt, "sms"); }}
                                          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-colors"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Message</p></TooltipContent>
                                    </Tooltip>
                                    <div className="w-px h-3.5 bg-border/30" />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, evt, "reschedule"); }}
                                          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-colors"
                                        >
                                          <CalendarClock className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Reschedule</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {viewTab === "feed" && (
              <div className="max-w-2xl mx-auto space-y-0">
                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Rss className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground">No activity to show</p>
                  </div>
                ) : (
                  filteredEvents.map((evt, i) => {
                    const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                    const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                    const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                    const isLast = i === filteredEvents.length - 1;
                    return (
                      <div key={evt.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white", urgencyColor ? urgencyColor.border : `border-${colors.dot.replace("bg-", "")}`)}>
                            <Icon className={cn("h-3.5 w-3.5", urgencyColor ? urgencyColor.text : colors.text)} />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                        </div>
                        <div className="flex-1 pb-4 cursor-pointer" onClick={() => navigate(getEventNavigation(evt))}>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-foreground">{evt.title}</p>
                            <Badge variant="outline" className={cn(
                              "text-[8px] border rounded-md",
                              urgencyColor ? cn(urgencyColor.bg, urgencyColor.text, urgencyColor.border) : cn(colors.bg, colors.text),
                            )}>
                              {evt.isOverdue ? "Overdue" : colors.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span>{format(evt.date, "MMM d, yyyy")}</span>
                            {evt.time && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {evt.time}</span>}
                          </div>
                          {evt.propertyAddress && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" /> {evt.propertyAddress}
                            </span>
                          )}
                          {evt.meta?.notes && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 bg-muted/30 rounded-md px-2.5 py-1.5 line-clamp-2">{evt.meta.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-[340px] border-l border-border bg-white overflow-y-auto hidden lg:block">
              {/* Sidebar header */}
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-base font-bold text-foreground">{format(selectedDate, "EEEE, MMMM d")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
                </p>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">You're clear for this day.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Want to generate outreach?</p>
                  <Button size="sm" variant="outline" className="mt-4 text-xs rounded-lg gap-1.5" onClick={() => navigate("/intel")}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Find Opportunities
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {selectedDateEvents.map((evt) => {
                    const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                    const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                    const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;

                    return (
                      <div
                        key={evt.id}
                        className="border-b border-border px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => navigate(getEventNavigation(evt))}
                      >
                        {/* Event header */}
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            urgencyColor ? urgencyColor.bg : colors.bg,
                          )}>
                            <Icon className={cn("h-4 w-4", urgencyColor ? urgencyColor.text : colors.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{evt.contactName || evt.title.split(" - ")[0]}</p>
                            {evt.propertyAddress && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-xs text-muted-foreground truncate">{evt.propertyAddress}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className={cn(
                                "text-[9px] border rounded-md",
                                urgencyColor ? cn(urgencyColor.bg, urgencyColor.text, urgencyColor.border) : cn(colors.bg, colors.text),
                              )}>
                                {evt.isOverdue ? "Overdue" : colors.label}
                              </Badge>
                              {evt.time && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {evt.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* AI Priority Signal */}
                        {(evt.urgency && evt.urgency !== "low") && (
                          <div className="mt-3 px-3 py-2 rounded-lg bg-muted/40 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-[11px] text-muted-foreground">Risk:</span>
                              <Badge variant="outline" className={cn(
                                "text-[9px] border rounded-md",
                                URGENCY_COLORS[evt.urgency!].bg,
                                URGENCY_COLORS[evt.urgency!].text,
                                URGENCY_COLORS[evt.urgency!].border,
                              )}>
                                {evt.urgency === "critical" ? "Critical" : evt.urgency === "high" ? "High" : "Medium"}
                              </Badge>
                              {evt.lastContactDays !== undefined && (
                                <span className="text-[11px] text-muted-foreground">
                                  · {evt.lastContactDays}d since contact
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* AI Context */}
                        <AIContext event={evt} />

                        {/* Actions */}
                        <EventActions event={evt} navigate={navigate} />
                      </div>
                    );
                  })}

                  {/* AI Notes */}
                  {selectedDateEvents.some((e) => e.meta?.notes) && (
                    <details className="border-b border-border">
                      <summary className="px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/20 transition-colors">
                        AI Notes
                      </summary>
                      <div className="px-5 pb-4 space-y-2">
                        {selectedDateEvents.filter((e) => e.meta?.notes).map((evt) => (
                          <div key={`note-${evt.id}`} className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                            <span className="font-medium text-foreground">{evt.contactName || evt.propertyAddress}: </span>
                            {evt.meta!.notes}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
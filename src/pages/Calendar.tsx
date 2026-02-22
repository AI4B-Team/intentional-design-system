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
  low: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
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
      <div className="flex flex-col h-full overflow-hidden">
        {/* Title and action buttons */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 gap-2">
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/communications?mode=power-hour")} className="text-xs gap-1.5 bg-primary hover:bg-primary/90">
            <Zap className="h-3 w-3" />
            Start Power Hour
          </Button>
          <Button size="sm" variant={teamMode ? "default" : "outline"} onClick={() => setTeamMode(!teamMode)} className="text-xs gap-1.5">
            <Users className="h-3 w-3" />
            {teamMode ? "Team" : "Solo"}
          </Button>
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

        {/* View Tab Bar */}
        <div className="flex items-center justify-between px-6 pt-2 pb-1">
          <div className="flex items-center gap-1">
            {([
              { id: "calendar" as CalendarViewTab, icon: CalendarIcon, label: "Calendar" },
              { id: "plan" as CalendarViewTab, icon: List, label: "Plan" },
              { id: "kanban" as CalendarViewTab, icon: Kanban, label: "Kanban" },
              { id: "grid" as CalendarViewTab, icon: LayoutGrid, label: "Grid" },
            ]).map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={viewTab === tab.id ? "default" : "ghost"}
                onClick={() => setViewTab(tab.id)}
                className={cn(
                  "gap-1.5 text-xs rounded-md px-4",
                  viewTab === tab.id && "bg-primary text-primary-foreground shadow-sm"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>
          {/* Right side tools */}
          <div className="flex items-center gap-1">
            {/* Search */}
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-48 text-xs"
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
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Search</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Filter */}
            <Popover>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost" className={cn("h-8 w-8", activeFilters.length > 0 && "text-primary")}>
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
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors",
                      activeFilters.includes(type) && "bg-primary/5"
                    )}
                  >
                    <div className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
                    <span className="flex-1 text-left capitalize">{colors.label}</span>
                    {activeFilters.includes(type) && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
                {activeFilters.length > 0 && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => setActiveFilters([])}
                      className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </PopoverContent>
            </Popover>

            {/* Export */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Export CSV</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* More Options */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
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

            {/* Panel Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

        {/* Calendar Controls */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            {/* View Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs capitalize">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {viewMode}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white w-32">
                {(["day", "week", "month"] as ViewMode[]).map((v) => (
                  <DropdownMenuItem key={v} onClick={() => setViewMode(v)} className="capitalize text-xs">
                    {v}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="icon" variant="default" onClick={goToToday} className="h-8 w-8" title="Today">
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={goToPrev} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={goToNext} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <span className="text-sm font-semibold text-foreground">
            {viewMode === "day"
              ? format(currentDate, "EEEE, MMM d, yyyy")
              : viewMode === "week"
                ? `Week of ${format(startOfWeek(currentDate), "MMM d")}`
                : format(currentDate, "MMMM yyyy")}
          </span>
        </div>

        {/* Active filters indicator */}
        {(activeFilters.length > 0 || searchQuery) && (
          <div className="flex items-center gap-2 px-6 py-1.5 bg-muted/30 border-b border-border">
            {activeFilters.map((f) => (
              <Badge key={f} variant="secondary" className="text-[10px] gap-1 capitalize">
                <div className={cn("w-1.5 h-1.5 rounded-full", EVENT_COLORS[f]?.dot)} />
                {EVENT_COLORS[f]?.label}
                <button onClick={() => toggleFilter(f)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                Search: "{searchQuery}"
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-auto p-4">
            {viewTab === "calendar" && (
              <>
                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-px mb-1">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px flex-1 bg-border rounded-lg overflow-hidden">
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
                          "bg-white p-1.5 min-h-[80px] text-left transition-colors hover:bg-muted/50 flex flex-col",
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
              </>
            )}

            {viewTab === "plan" && (
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded",
                            isToday(parseISO(dateKey)) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {isToday(parseISO(dateKey)) ? "Today" : format(parseISO(dateKey), "EEEE, MMM d")}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] text-muted-foreground">{dayEvts.length} event{dayEvts.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="space-y-1 pl-2 border-l-2 border-border ml-2">
                          {dayEvts.map((evt) => {
                            const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                            const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                            const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                            return (
                              <div
                                key={evt.id}
                                onClick={() => navigate(getEventNavigation(evt))}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                              >
                                <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", urgencyColor ? urgencyColor.bg : colors.bg)}>
                                  <Icon className={cn("h-3.5 w-3.5", urgencyColor ? urgencyColor.text : colors.text)} />
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
                                    "text-[9px] border",
                                    urgencyColor ? cn(urgencyColor.bg, urgencyColor.text, urgencyColor.border) : cn(colors.bg, colors.text),
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

            {viewTab === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredEvents.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No events found</p>
                  </div>
                ) : (
                  filteredEvents.map((evt) => {
                    const colors = EVENT_COLORS[evt.type] || EVENT_COLORS.appointment;
                    const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                    const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => navigate(getEventNavigation(evt))}
                        className="flex flex-col p-4 rounded-lg border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", urgencyColor ? urgencyColor.bg : colors.bg)}>
                            <Icon className={cn("h-4 w-4", urgencyColor ? urgencyColor.text : colors.text)} />
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[9px] border",
                            urgencyColor ? cn(urgencyColor.bg, urgencyColor.text, urgencyColor.border) : cn(colors.bg, colors.text),
                          )}>
                            {evt.isOverdue ? "Overdue" : colors.label}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{evt.contactName || evt.title.split(" - ")[0]}</p>
                        {evt.propertyAddress && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                            <span className="text-[10px] text-muted-foreground truncate">{evt.propertyAddress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground">{format(evt.date, "MMM d, yyyy")}</span>
                          {evt.time && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {evt.time}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {viewTab === "kanban" && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Object.entries(EVENT_COLORS).map(([type, colors]) => {
                  const typeEvents = filteredEvents.filter((e) => e.type === type);
                  return (
                    <div key={type} className="flex-shrink-0 w-64 flex flex-col">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
                        <span className="text-xs font-semibold text-foreground capitalize">{colors.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{typeEvents.length}</span>
                      </div>
                      <div className="flex-1 space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/20 border border-border/50">
                        {typeEvents.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground text-center py-8">No events</p>
                        ) : (
                          typeEvents.map((evt) => {
                            const Icon = EVENT_ICONS[evt.type] || CalendarIcon;
                            const urgencyColor = evt.urgency && evt.urgency !== "low" ? URGENCY_COLORS[evt.urgency] : null;
                            return (
                              <div
                                key={evt.id}
                                onClick={() => navigate(getEventNavigation(evt))}
                                className={cn(
                                  "p-3 rounded-lg bg-white border border-border hover:shadow-sm cursor-pointer transition-all",
                                  urgencyColor && `border-l-2 ${urgencyColor.border}`,
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", colors.text)} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-foreground truncate">{evt.contactName || evt.title.split(" - ")[0]}</p>
                                    {evt.propertyAddress && (
                                      <span className="text-[10px] text-muted-foreground truncate block">{evt.propertyAddress}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                  <span>{format(evt.date, "MMM d")}</span>
                                  {evt.time && <span>· {evt.time}</span>}
                                  {evt.isOverdue && <Badge variant="outline" className="text-[8px] text-destructive border-destructive/30">Overdue</Badge>}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewTab === "feed" && (
              <div className="max-w-2xl mx-auto space-y-0">
                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Rss className="h-10 w-10 text-muted-foreground/30 mb-3" />
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
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white", urgencyColor ? urgencyColor.border : `border-${colors.dot.replace("bg-", "")}`)}>
                            <Icon className={cn("h-3.5 w-3.5", urgencyColor ? urgencyColor.text : colors.text)} />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                        </div>
                        {/* Content */}
                        <div
                          className="flex-1 pb-4 cursor-pointer"
                          onClick={() => navigate(getEventNavigation(evt))}
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-foreground">{evt.title}</p>
                            <Badge variant="outline" className={cn(
                              "text-[8px] border",
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
                            <p className="text-[10px] text-muted-foreground mt-1.5 bg-muted/30 rounded px-2 py-1.5 line-clamp-2">{evt.meta.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Sidebar — Fixed Order: Context → Signal → Directive → Events → Notes */}
          {sidebarOpen && (
            <div className="w-[320px] border-l border-border bg-white overflow-y-auto hidden lg:block">
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

            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

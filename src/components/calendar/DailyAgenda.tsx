import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isToday } from "date-fns";
import {
  Flame,
  Phone,
  CalendarIcon,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "./types";

function navigateToEvent(navigate: ReturnType<typeof useNavigate>, event: CalendarEvent) {
  if (event.type === "followup" || event.isOverdue) {
    // Deep-link to Communications with context
    const params = new URLSearchParams();
    if (event.contactName) params.set("contact", event.contactName);
    if (event.propertyId) params.set("property", event.propertyId);
    params.set("filter", "needs_action");
    params.set("channel", "calls");
    navigate(`/communications?${params.toString()}`);
  } else if (event.type === "appointment") {
    // Deep-link to Dialer with contact preloaded
    if (event.propertyId) {
      navigate(`/communications?property=${event.propertyId}&channel=calls`);
    } else {
      navigate("/communications");
    }
  } else if (event.type === "offer_deadline" || event.type === "closing" || event.type === "inspection") {
    // Deep-link to property/deal
    if (event.propertyId) {
      navigate(`/properties/${event.propertyId}`);
    }
  }
}

export function DailyAgenda({ events }: { events: CalendarEvent[] }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const todayEvents = events.filter((e) => isToday(e.date));
  const overdueFollowups = events.filter((e) => e.isOverdue && e.type === "followup");
  const callsToMake = [...overdueFollowups, ...todayEvents.filter((e) => e.type === "followup" && !e.isOverdue)];
  const appointments = todayEvents.filter((e) => e.type === "appointment");
  const dealWatch = todayEvents.filter((e) => e.type === "offer_deadline" || e.type === "inspection" || e.type === "closing");
  const deadlines24h = events.filter((e) => {
    const hoursUntil = (e.date.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil > 0 && hoursUntil <= 24 && (e.type === "offer_deadline" || e.type === "inspection");
  });

  const hasContent = overdueFollowups.length > 0 || callsToMake.length > 0 || appointments.length > 0 || dealWatch.length > 0;
  if (!hasContent) return null;

  // AI recommendation: pick highest priority item
  const topPriority = overdueFollowups.sort((a, b) => (b.lastContactDays || 0) - (a.lastContactDays || 0))[0];

  return (
    <div className="border-b border-border bg-card">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-foreground">Today's Game Plan</h2>
            <p className="text-[10px] text-muted-foreground">AI-prioritized actions based on deals, conversations, and deadlines</p>
          </div>
        </div>
        {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <div className="px-6 pb-4 space-y-4">
          {/* Priority Focus Banner */}
          {(overdueFollowups.length > 0 || deadlines24h.length > 0) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame className="h-3.5 w-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-800">Priority Focus</span>
              </div>
              <div className="space-y-1">
                {overdueFollowups.length > 0 && (
                  <p className="text-[11px] text-red-700">
                    {overdueFollowups.length} overdue follow-up{overdueFollowups.length !== 1 ? "s" : ""} risk deal decay
                  </p>
                )}
                {deadlines24h.length > 0 && (
                  <p className="text-[11px] text-red-700">
                    {deadlines24h.length} contract deadline{deadlines24h.length !== 1 ? "s" : ""} in 24 hours
                  </p>
                )}
                <p className="text-[11px] text-red-600/70">Best call window: 10:00–12:00 PM</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Calls to Make */}
            {callsToMake.length > 0 && (
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-foreground">Calls to Make ({callsToMake.length})</span>
                </div>
                <div className="space-y-1.5">
                  {callsToMake.slice(0, 4).map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => navigateToEvent(navigate, evt)}
                      className="w-full text-left flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 transition-colors group"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        evt.isOverdue ? "bg-red-500" : "bg-amber-500",
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">
                          {evt.contactName || evt.propertyAddress || evt.title.replace("Follow up: ", "").replace("Overdue: ", "")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {evt.isOverdue ? "Overdue" : "Scheduled"}{evt.lastContactDays ? ` · ${evt.lastContactDays}d since contact` : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="default"
                  className="w-full mt-2 text-xs h-8"
                  onClick={() => navigate("/communications?channel=calls&filter=needs_action")}
                >
                  <Phone className="h-3 w-3 mr-1.5" />
                  Start Dialing
                </Button>
              </div>
            )}

            {/* Appointments */}
            {appointments.length > 0 && (
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Appointments ({appointments.length})</span>
                </div>
                <div className="space-y-1.5">
                  {appointments.slice(0, 4).map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => navigateToEvent(navigate, evt)}
                      className="w-full text-left flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{evt.title.split(" - ")[0]}</p>
                        <p className="text-[10px] text-muted-foreground">{evt.time} · {evt.propertyAddress}</p>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
                {appointments[0]?.propertyId && (
                  <p className="text-[10px] text-muted-foreground mt-2 px-2">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    Prep comps before call (AI ready)
                  </p>
                )}
              </div>
            )}

            {/* Deal Watch */}
            {dealWatch.length > 0 && (
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-foreground">Deal Watch ({dealWatch.length})</span>
                </div>
                <div className="space-y-1.5">
                  {dealWatch.slice(0, 4).map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => navigateToEvent(navigate, evt)}
                      className="w-full text-left flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 transition-colors group"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        evt.type === "closing" ? "bg-emerald-500" : evt.type === "inspection" ? "bg-blue-500" : "bg-red-500",
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{evt.propertyAddress || evt.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {evt.type === "inspection" ? "Inspection" : evt.type === "closing" ? "Closing" : "Deadline"} · Risk: {evt.urgency === "critical" ? "High" : evt.urgency === "high" ? "Medium" : "Low"}
                        </p>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendation */}
          {topPriority && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
              <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-foreground">AI Recommendation</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Call {topPriority.contactName || topPriority.propertyAddress || "this contact"} first.
                  {topPriority.lastContactDays && topPriority.lastContactDays > 5
                    ? ` Last contact was ${topPriority.lastContactDays} days ago — deal probability increases +18% if contacted before noon.`
                    : " Deal probability increases +18% if contacted before noon."}
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="text-xs h-7 shrink-0"
                onClick={() => navigateToEvent(navigate, topPriority)}
              >
                <Phone className="h-3 w-3 mr-1" />
                Call Now
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import type { useNavigate } from "react-router-dom";
import { addDays, format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, CalendarClock, CheckCircle2, Clock, MapPin, Sparkles, AlertCircle, Calendar as CalendarIcon, FileText, Home } from "lucide-react";
import type { CalendarEvent } from "@/components/calendar/types";
import type { useCompleteAction, useUpdateAction } from "@/hooks/useUnifiedActions";
import { EVENT_COLORS, URGENCY_COLORS, EVENT_ICONS, handleQuickAction } from "@/components/calendar/calendar-constants";

interface CalendarKanbanViewProps {
  events: CalendarEvent[];
  navigate: ReturnType<typeof useNavigate>;
  completeAction: ReturnType<typeof useCompleteAction>;
  updateAction: ReturnType<typeof useUpdateAction>;
  onReschedule?: (event: CalendarEvent) => void;
}

export function CalendarKanbanView({ events: filteredEvents, navigate, completeAction, updateAction, onReschedule }: CalendarKanbanViewProps) {

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
                                  "group rounded-lg bg-card border border-border/60 hover:shadow-md cursor-pointer transition-all overflow-hidden",
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
                                          onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, evt, "call", completeAction, updateAction); }}
                                          className="flex-[2] flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                                        >
                                          <Phone className="h-3 w-3" />
                                          Call
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Call Now</p></TooltipContent>
                                    </Tooltip>
                                    <div className="w-px h-3.5 bg-border/30" />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, evt, "sms", completeAction, updateAction); }}
                                          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-colors"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Message</p></TooltipContent>
                                    </Tooltip>
                                    <div className="w-px h-3.5 bg-border/30" />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleQuickAction(navigate, evt, "reschedule", completeAction, updateAction, openRescheduleDialog); }}
                                          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-colors"
                                        >
                                          <CalendarClock className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]"><p className="text-xs">Reschedule</p></TooltipContent>
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
            }

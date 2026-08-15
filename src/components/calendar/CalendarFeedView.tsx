import * as React from "react";
import type { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Rss, Calendar as CalendarIcon } from "lucide-react";
import type { CalendarEvent } from "@/components/calendar/types";
import { EVENT_COLORS, URGENCY_COLORS, EVENT_ICONS, getEventNavigation } from "@/components/calendar/calendar-constants";

interface CalendarFeedViewProps {
  events: CalendarEvent[];
  navigate: ReturnType<typeof useNavigate>;
}

export function CalendarFeedView({ events: filteredEvents, navigate }: CalendarFeedViewProps) {
  return (

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
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-card", urgencyColor ? urgencyColor.border : `border-${colors.dot.replace("bg-", "")}`)}>
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
              );
}

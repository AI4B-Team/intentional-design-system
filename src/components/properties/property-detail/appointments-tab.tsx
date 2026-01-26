import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, MapPin, Video, Phone, User } from "lucide-react";

interface Appointment {
  id: string;
  type: "showing" | "inspection" | "call" | "video_call" | "signing";
  date: string;
  time: string;
  duration: string;
  status: "upcoming" | "completed" | "cancelled" | "no_show";
  location?: string;
  attendees?: string[];
  notes?: string;
}

const sampleAppointments: Appointment[] = [
  {
    id: "1",
    type: "showing",
    date: "Tomorrow",
    time: "10:00 AM",
    duration: "30 min",
    status: "upcoming",
    location: "1423 Elm Street, Austin, TX",
    attendees: ["John Smith (Owner)"],
    notes: "Walkthrough to assess property condition",
  },
  {
    id: "2",
    type: "call",
    date: "Friday, Jan 31",
    time: "2:00 PM",
    duration: "15 min",
    status: "upcoming",
    attendees: ["John Smith (Owner)"],
    notes: "Follow-up call to discuss offer",
  },
  {
    id: "3",
    type: "showing",
    date: "Jan 24",
    time: "11:00 AM",
    duration: "45 min",
    status: "completed",
    location: "1423 Elm Street, Austin, TX",
    attendees: ["John Smith (Owner)", "Mike (Contractor)"],
    notes: "Initial property viewing with contractor for repair estimate",
  },
  {
    id: "4",
    type: "call",
    date: "Jan 22",
    time: "3:00 PM",
    duration: "10 min",
    status: "no_show",
    attendees: ["John Smith (Owner)"],
    notes: "Scheduled intro call - owner did not answer",
  },
];

function getTypeIcon(type: Appointment["type"]) {
  switch (type) {
    case "showing":
    case "inspection":
      return MapPin;
    case "call":
      return Phone;
    case "video_call":
      return Video;
    case "signing":
      return Calendar;
  }
}

function getTypeLabel(type: Appointment["type"]) {
  switch (type) {
    case "showing":
      return "Property Showing";
    case "inspection":
      return "Inspection";
    case "call":
      return "Phone Call";
    case "video_call":
      return "Video Call";
    case "signing":
      return "Contract Signing";
  }
}

function getStatusConfig(status: Appointment["status"]) {
  switch (status) {
    case "upcoming":
      return { label: "Upcoming", variant: "info" as const };
    case "completed":
      return { label: "Completed", variant: "success" as const };
    case "cancelled":
      return { label: "Cancelled", variant: "secondary" as const };
    case "no_show":
      return { label: "No Show", variant: "error" as const };
  }
}

export function AppointmentsTab() {
  const appointments = sampleAppointments;

  // Group by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const upcomingCount = appointments.filter(a => a.status === "upcoming").length;

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-content">Appointments</h3>
          <p className="text-small text-content-secondary">
            {upcomingCount} upcoming, {appointments.length - upcomingCount} past
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus />}>
          Schedule
        </Button>
      </div>

      {/* Grouped by Date */}
      <div className="space-y-6">
        {Object.entries(groupedAppointments).map(([date, dateAppointments]) => {
          const isPast = !["Today", "Tomorrow"].includes(date) && 
            dateAppointments.every(a => a.status !== "upcoming");

          return (
            <div key={date}>
              {/* Date Header - Sticky */}
              <div className={cn(
                "sticky top-0 z-10 -mx-lg px-lg py-2 mb-3",
                "bg-gradient-to-b from-white via-white to-transparent"
              )}>
                <span className={cn(
                  "text-small font-medium",
                  isPast ? "text-content-tertiary" : "text-content"
                )}>
                  {date}
                </span>
              </div>

              {/* Appointments for this date */}
              <div className="space-y-3">
                {dateAppointments.map((appointment) => {
                  const Icon = getTypeIcon(appointment.type);
                  const typeLabel = getTypeLabel(appointment.type);
                  const statusConfig = getStatusConfig(appointment.status);
                  const isPastAppointment = appointment.status !== "upcoming";

                  return (
                    <Card
                      key={appointment.id}
                      variant="default"
                      padding="md"
                      className={cn(
                        "transition-all",
                        isPastAppointment && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Time Column */}
                        <div className="w-20 flex-shrink-0 text-center">
                          <div className="text-h3 font-semibold text-content tabular-nums">
                            {appointment.time.split(" ")[0]}
                          </div>
                          <div className="text-tiny text-content-secondary">
                            {appointment.time.split(" ")[1]}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px self-stretch bg-border-subtle" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-full bg-surface-secondary flex items-center justify-center">
                              <Icon className="h-3.5 w-3.5 text-content-secondary" />
                            </div>
                            <span className="text-body font-medium text-content">
                              {typeLabel}
                            </span>
                            <Badge variant={statusConfig.variant} size="sm">
                              {statusConfig.label}
                            </Badge>
                          </div>

                          {appointment.location && (
                            <div className="flex items-center gap-2 text-small text-content-secondary mb-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{appointment.location}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-small text-content-secondary mb-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{appointment.duration}</span>
                          </div>

                          {appointment.attendees && appointment.attendees.length > 0 && (
                            <div className="flex items-center gap-2 text-small text-content-secondary">
                              <User className="h-3.5 w-3.5" />
                              <span>{appointment.attendees.join(", ")}</span>
                            </div>
                          )}

                          {appointment.notes && (
                            <p className="text-small text-content-secondary mt-2 bg-surface-secondary/50 rounded-small p-2">
                              {appointment.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {appointment.status === "upcoming" && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button variant="secondary" size="sm">
                              Reschedule
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

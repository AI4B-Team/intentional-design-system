import * as React from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  MoreHorizontal,
  Edit,
  XCircle,
  CheckCircle,
  CalendarCheck,
} from "lucide-react";
import { usePropertyAppointments } from "@/hooks/useProperty";
import { useUpdateAppointment, useDeleteAppointment } from "@/hooks/usePropertyMutations";
import { AddAppointmentModal } from "./add-appointment-modal";
import { CompleteAppointmentModal } from "./complete-appointment-modal";
import { format, isToday, isTomorrow, isPast } from "date-fns";

function getTypeIcon(type: string | null) {
  switch (type) {
    case "showing":
    case "inspection":
    case "in_person":
      return MapPin;
    case "call":
    case "phone":
      return Phone;
    case "video":
    case "video_call":
      return Video;
    case "signing":
      return Calendar;
    default:
      return Calendar;
  }
}

function getTypeLabel(type: string | null) {
  switch (type) {
    case "showing":
      return "Property Showing";
    case "inspection":
      return "Inspection";
    case "call":
    case "phone":
      return "Phone Call";
    case "video":
    case "video_call":
      return "Video Call";
    case "in_person":
      return "In Person";
    case "signing":
      return "Contract Signing";
    default:
      return type || "Appointment";
  }
}

function getStatusConfig(status: string | null): { label: string; variant: "info" | "success" | "secondary" | "error" } {
  switch (status) {
    case "scheduled":
      return { label: "Upcoming", variant: "info" };
    case "completed":
      return { label: "Completed", variant: "success" };
    case "cancelled":
      return { label: "Cancelled", variant: "secondary" };
    case "no_show":
      return { label: "No Show", variant: "error" };
    default:
      return { label: "Scheduled", variant: "info" };
  }
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMM d");
}

const filterOptions = ["all", "upcoming", "completed", "cancelled"] as const;

export function AppointmentsTab() {
  const { id } = useParams();
  const { data: appointments, isLoading } = usePropertyAppointments(id);
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showCompleteModal, setShowCompleteModal] = React.useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<typeof filterOptions[number]>("all");

  const filteredAppointments = React.useMemo(() => {
    if (!appointments) return [];
    if (filter === "all") return appointments;
    if (filter === "upcoming") return appointments.filter((a) => a.status === "scheduled");
    if (filter === "completed") return appointments.filter((a) => a.status === "completed");
    if (filter === "cancelled") return appointments.filter((a) => a.status === "cancelled" || a.status === "no_show");
    return appointments;
  }, [appointments, filter]);

  // Group by date
  const groupedAppointments = React.useMemo(() => {
    return filteredAppointments.reduce((groups, appointment) => {
      const date = appointment.scheduled_time
        ? formatDateLabel(appointment.scheduled_time)
        : "Unknown";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {} as Record<string, typeof filteredAppointments>);
  }, [filteredAppointments]);

  const upcomingCount = appointments?.filter((a) => a.status === "scheduled").length || 0;

  const handleCancel = (appointmentId: string) => {
    updateAppointment.mutate({ id: appointmentId, updates: { status: "cancelled" } });
  };

  const handleMarkComplete = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowCompleteModal(true);
  };

  const handleDelete = (appointmentId: string) => {
    if (!id) return;
    deleteAppointment.mutate({ id: appointmentId, propertyId: id });
  };

  if (isLoading) {
    return (
      <div className="p-lg space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg flex-wrap gap-3">
        <div>
          <h3 className="text-h3 font-medium text-foreground">Appointments</h3>
          <p className="text-small text-muted-foreground">
            {upcomingCount} upcoming, {(appointments?.length || 0) - upcomingCount} past
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-background-secondary rounded-medium p-1">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "px-3 py-1.5 text-small font-medium rounded-small transition-colors capitalize",
                  filter === opt
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Schedule
          </Button>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-foreground mb-2">
            {filter === "all" ? "No appointments scheduled" : `No ${filter} appointments`}
          </h4>
          <p className="text-small text-muted-foreground mb-4">
            Schedule your first appointment!
          </p>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Schedule Appointment
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => {
            const isPastDate = dateAppointments.every(
              (a) => a.status !== "scheduled" || (a.scheduled_time && isPast(new Date(a.scheduled_time)))
            );

            return (
              <div key={date}>
                {/* Date Header */}
                <div
                  className={cn(
                    "sticky top-0 z-10 -mx-lg px-lg py-2 mb-3",
                    "bg-gradient-to-b from-white via-white to-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "text-small font-medium",
                      isPastDate ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {date}
                  </span>
                </div>

                {/* Appointments for this date */}
                <div className="space-y-3">
                  {dateAppointments.map((appointment) => {
                    const Icon = getTypeIcon(appointment.appointment_type);
                    const typeLabel = getTypeLabel(appointment.appointment_type);
                    const statusConfig = getStatusConfig(appointment.status);
                    const isPastAppointment = appointment.status !== "scheduled";

                    return (
                      <Card
                        key={appointment.id}
                        variant="default"
                        padding="md"
                        className={cn("transition-all", isPastAppointment && "opacity-60")}
                      >
                        <div className="flex items-start gap-4">
                          {/* Time Column */}
                          <div className="w-20 flex-shrink-0 text-center">
                            <div className="text-h3 font-semibold text-foreground tabular-nums">
                              {appointment.scheduled_time
                                ? format(new Date(appointment.scheduled_time), "h:mm")
                                : "--:--"}
                            </div>
                            <div className="text-tiny text-muted-foreground">
                              {appointment.scheduled_time
                                ? format(new Date(appointment.scheduled_time), "a")
                                : ""}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="w-px self-stretch bg-border-subtle" />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <div className="h-7 w-7 rounded-full bg-background-secondary flex items-center justify-center">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-body font-medium text-foreground">
                                {typeLabel}
                              </span>
                              <Badge variant={statusConfig.variant} size="sm">
                                {statusConfig.label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-small text-muted-foreground mb-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{appointment.duration_minutes || 30} minutes</span>
                            </div>

                            {appointment.assigned_to && (
                              <div className="flex items-center gap-2 text-small text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span>{appointment.assigned_to}</span>
                              </div>
                            )}

                            {appointment.outcome && (
                              <div className="mt-2 p-2 bg-success/5 border-l-2 border-success rounded-r-small">
                                <p className="text-small text-foreground">
                                  <span className="font-medium">Outcome:</span> {appointment.outcome}
                                </p>
                              </div>
                            )}

                            {appointment.notes && !appointment.outcome && (
                              <p className="text-small text-muted-foreground mt-2 bg-background-secondary/50 rounded-small p-2 line-clamp-2">
                                {appointment.notes}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {appointment.status === "scheduled" && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleMarkComplete(appointment.id)}
                                >
                                  Mark Complete
                                </Button>
                              </>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 hover:bg-background-secondary rounded-small transition-colors">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 bg-white">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {appointment.status === "scheduled" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleCancel(appointment.id)}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkComplete(appointment.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Complete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(appointment.id)}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddAppointmentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        propertyId={id || ""}
      />
      {selectedAppointmentId && (
        <CompleteAppointmentModal
          open={showCompleteModal}
          onOpenChange={setShowCompleteModal}
          appointmentId={selectedAppointmentId}
          propertyId={id || ""}
          onScheduleFollowUp={() => setShowAddModal(true)}
        />
      )}
    </div>
  );
}

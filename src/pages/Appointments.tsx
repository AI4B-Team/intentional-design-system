import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, User, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from "date-fns";

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    title: "Property Walkthrough",
    property: "123 Oak Street, Austin TX",
    contact: "John Smith",
    phone: "(512) 555-1234",
    date: new Date(),
    time: "10:00 AM",
    duration: 60,
    type: "walkthrough",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Seller Meeting",
    property: "456 Elm Ave, Round Rock TX",
    contact: "Mary Johnson",
    phone: "(512) 555-5678",
    date: new Date(),
    time: "2:00 PM",
    duration: 30,
    type: "meeting",
    status: "pending",
  },
  {
    id: "3",
    title: "Contractor Walkthrough",
    property: "789 Pine Blvd, Cedar Park TX",
    contact: "Bob Builder",
    phone: "(512) 555-9012",
    date: addDays(new Date(), 1),
    time: "9:00 AM",
    duration: 90,
    type: "contractor",
    status: "confirmed",
  },
  {
    id: "4",
    title: "Closing",
    property: "321 Maple Dr, Pflugerville TX",
    contact: "Title Company",
    phone: "(512) 555-3456",
    date: addDays(new Date(), 2),
    time: "1:00 PM",
    duration: 120,
    type: "closing",
    status: "confirmed",
  },
];

const typeColors: Record<string, string> = {
  walkthrough: "bg-info/10 text-info border-info/30",
  meeting: "bg-warning/10 text-warning border-warning/30",
  contractor: "bg-accent/10 text-accent border-accent/30",
  closing: "bg-success/10 text-success border-success/30",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function Appointments() {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getAppointmentsForDay = (date: Date) => {
    return mockAppointments.filter(apt => isSameDay(apt.date, date));
  };

  const todaysAppointments = mockAppointments.filter(apt => isSameDay(apt.date, new Date()));

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Pipeline", href: "/pipeline" },
        { label: "Appointments" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your property walkthroughs, meetings, and closings
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todaysAppointments.length}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAppointments.filter(a => a.type === "walkthrough").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Walkthroughs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAppointments.filter(a => a.status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockAppointments.filter(a => a.type === "closing").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Closings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Week View</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
                </span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDay(day);
                const dayIsToday = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] p-2 rounded-lg border ${
                      dayIsToday ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-2 ${dayIsToday ? "text-primary" : "text-muted-foreground"}`}>
                      <div>{format(day, "EEE")}</div>
                      <div className={`text-lg font-bold ${dayIsToday ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-[10px] p-1.5 rounded border ${typeColors[apt.type]}`}
                        >
                          <div className="font-medium truncate">{apt.time}</div>
                          <div className="truncate opacity-80">{apt.title}</div>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className={`p-3 rounded-lg ${typeColors[apt.type]}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{apt.title}</h4>
                        <Badge className={statusColors[apt.status]} variant="secondary">
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {apt.time} ({apt.duration} min)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {apt.property}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {apt.contact}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {apt.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button size="sm">
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAppointments
                .filter(apt => apt.date > new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className={`p-2 rounded-lg ${typeColors[apt.type]}`}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{apt.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(apt.date, "EEE, MMM d")} at {apt.time}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{apt.property}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

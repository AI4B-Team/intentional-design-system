import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Users, Calendar, Clock, TrendingUp } from "lucide-react";

interface DialerStatsBarProps {
  callsMade: number;
  contactsReached: number;
  appointmentsSet: number;
  totalTalkTime: number;
  sessionDuration: number;
}

export function DialerStatsBar({
  callsMade,
  contactsReached,
  appointmentsSet,
  totalTalkTime,
  sessionDuration,
}: DialerStatsBarProps) {
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const reachRate = callsMade > 0 ? Math.round((contactsReached / callsMade) * 100) : 0;
  const callsPerHour = sessionDuration > 60 
    ? ((callsMade / sessionDuration) * 3600).toFixed(1) 
    : callsMade.toString();

  const stats = [
    {
      label: "Calls Made",
      value: callsMade.toString(),
      icon: Phone,
      color: "text-info",
    },
    {
      label: "Contacts Reached",
      value: `${contactsReached} (${reachRate}%)`,
      icon: Users,
      color: "text-success",
    },
    {
      label: "Appointments",
      value: appointmentsSet.toString(),
      icon: Calendar,
      color: "text-warning",
    },
    {
      label: "Talk Time",
      value: formatTime(totalTalkTime),
      icon: Clock,
      color: "text-purple-500",
    },
    {
      label: "Calls/Hour",
      value: callsPerHour,
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-background-secondary rounded-medium border border-border-subtle">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <div className={cn("p-2 rounded-small bg-white", stat.color)}>
            <stat.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-tiny text-muted-foreground">{stat.label}</p>
            <p className="text-body font-semibold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

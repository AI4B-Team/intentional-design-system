import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type ActivityType = "lead" | "contact" | "offer" | "response" | "closed";

interface Activity {
  id: string | number;
  type: ActivityType;
  description: string;
  target: string;
  targetHref?: string;
  time: string;
}

interface RecentActivityListProps {
  activities: Activity[];
  className?: string;
}

const activityColors: Record<ActivityType, string> = {
  lead: "bg-info",
  contact: "bg-success",
  offer: "bg-warning",
  response: "bg-purple-500",
  closed: "bg-emerald-500",
};

export function RecentActivityList({ activities, className }: RecentActivityListProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline Line */}
      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative flex items-start gap-4 group animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Dot */}
            <div
              className={cn(
                "relative z-10 h-[14px] w-[14px] rounded-full shrink-0 mt-1 ring-4 ring-white",
                activityColors[activity.type]
              )}
            />

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5 rounded-medium transition-colors group-hover:bg-surface-secondary group-hover:px-3 group-hover:-mx-3">
              <p className="text-body text-content">
                {activity.description}{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-tiny text-content-tertiary mt-0.5">
                {activity.time}
              </p>
            </div>

            {/* Link */}
            {activity.targetHref && (
              <a
                href={activity.targetHref}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-small hover:bg-surface-tertiary"
              >
                <ArrowRight className="h-4 w-4 text-content-secondary" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

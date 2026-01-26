import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MessageSquare,
  Mail,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Activity {
  id: string;
  type: "sms" | "email" | "call";
  direction: "outbound" | "inbound";
  date: string;
  time: string;
  subject?: string;
  preview: string;
  fullContent?: string;
  duration?: string;
  outcome?: string;
}

const sampleActivities: Activity[] = [
  {
    id: "1",
    type: "call",
    direction: "outbound",
    date: "Today",
    time: "2:30 PM",
    preview: "Spoke with owner about property condition",
    duration: "8 min",
    outcome: "Interested",
    fullContent: "Owner John confirmed interest in selling. Property has been vacant for 6 months. Mentioned he's motivated due to upcoming relocation. Scheduled follow-up for Friday.",
  },
  {
    id: "2",
    type: "sms",
    direction: "inbound",
    date: "Today",
    time: "11:15 AM",
    preview: "Yes, I'm interested. What's your best offer?",
  },
  {
    id: "3",
    type: "sms",
    direction: "outbound",
    date: "Yesterday",
    time: "4:45 PM",
    preview: "Hi John, following up on the property at 1423 Elm Street...",
    fullContent: "Hi John, following up on the property at 1423 Elm Street. We're ready to make a cash offer and can close quickly. Would you be available for a quick call tomorrow?",
  },
  {
    id: "4",
    type: "email",
    direction: "outbound",
    date: "Jan 23",
    time: "9:00 AM",
    subject: "Cash Offer for Your Property",
    preview: "Dear Mr. Smith, I hope this email finds you well...",
    fullContent: "Dear Mr. Smith,\n\nI hope this email finds you well. My name is Brian and I'm a local real estate investor interested in purchasing your property at 1423 Elm Street.\n\nWe buy houses as-is for cash and can close on your timeline. If you're interested in exploring a sale, I'd love to schedule a brief call to discuss.\n\nBest regards,\nBrian",
  },
  {
    id: "5",
    type: "call",
    direction: "outbound",
    date: "Jan 22",
    time: "3:15 PM",
    preview: "Left voicemail",
    duration: "1 min",
    outcome: "No Answer",
  },
];

function getTypeIcon(type: Activity["type"]) {
  switch (type) {
    case "sms":
      return MessageSquare;
    case "email":
      return Mail;
    case "call":
      return Phone;
  }
}

function getTypeColor(type: Activity["type"]) {
  switch (type) {
    case "sms":
      return "bg-info/10 text-info";
    case "email":
      return "bg-purple-100 text-purple-600";
    case "call":
      return "bg-success/10 text-success";
  }
}

export function OutreachTab() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const activities = sampleActivities;

  // Group by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-content">Outreach History</h3>
          <p className="text-small text-content-secondary">{activities.length} interactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Phone />}>
            Log Call
          </Button>
          <Button variant="secondary" size="sm" icon={<MessageSquare />}>
            Send SMS
          </Button>
          <Button variant="secondary" size="sm" icon={<Mail />}>
            Send Email
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        {/* Grouped Activities */}
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="relative flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center z-10">
                  <span className="text-tiny font-medium text-content-secondary">
                    {date === "Today" ? "T" : date === "Yesterday" ? "Y" : date.slice(0, 3)}
                  </span>
                </div>
                <span className="text-small font-medium text-content">{date}</span>
              </div>

              {/* Activities for this date */}
              <div className="ml-14 space-y-3">
                {dateActivities.map((activity) => {
                  const Icon = getTypeIcon(activity.type);
                  const colorClass = getTypeColor(activity.type);
                  const isExpanded = expandedId === activity.id;
                  const hasFullContent = activity.fullContent && activity.fullContent !== activity.preview;

                  return (
                    <div
                      key={activity.id}
                      className={cn(
                        "relative bg-white border border-border-subtle rounded-medium p-4 transition-all",
                        hasFullContent && "cursor-pointer hover:border-border"
                      )}
                      onClick={() => hasFullContent && setExpandedId(isExpanded ? null : activity.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-body font-medium text-content capitalize">
                              {activity.type}
                            </span>
                            {activity.direction === "outbound" ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-content-tertiary" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                            )}
                            {activity.outcome && (
                              <Badge
                                variant={activity.outcome === "Interested" ? "success" : "secondary"}
                                size="sm"
                              >
                                {activity.outcome}
                              </Badge>
                            )}
                            {activity.duration && (
                              <span className="text-tiny text-content-tertiary">{activity.duration}</span>
                            )}
                          </div>

                          {activity.subject && (
                            <div className="text-small font-medium text-content mb-1">
                              {activity.subject}
                            </div>
                          )}

                          <p className={cn(
                            "text-small text-content-secondary",
                            !isExpanded && "line-clamp-2"
                          )}>
                            {isExpanded ? activity.fullContent : activity.preview}
                          </p>

                          {hasFullContent && (
                            <button className="flex items-center gap-1 text-tiny text-brand-accent mt-2 hover:underline">
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Show more
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Time */}
                        <span className="text-tiny text-content-tertiary flex-shrink-0">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

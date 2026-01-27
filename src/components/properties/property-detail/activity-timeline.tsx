import * as React from "react";
import { usePropertyActivity, formatActivityMessage, type ActivityLogEntry } from "@/hooks/useActivityLog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Pencil,
  UserPlus,
  ArrowRight,
  DollarSign,
  Calendar,
  Phone,
  FileText,
  Upload,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  propertyId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getActionIcon(action: string) {
  switch (action) {
    case "created":
      return <Plus className="h-3.5 w-3.5" />;
    case "updated":
      return <Pencil className="h-3.5 w-3.5" />;
    case "assigned":
    case "unassigned":
      return <UserPlus className="h-3.5 w-3.5" />;
    case "status_changed":
      return <ArrowRight className="h-3.5 w-3.5" />;
    case "offer_made":
      return <DollarSign className="h-3.5 w-3.5" />;
    case "appointment_scheduled":
      return <Calendar className="h-3.5 w-3.5" />;
    case "call_logged":
      return <Phone className="h-3.5 w-3.5" />;
    case "note_added":
      return <FileText className="h-3.5 w-3.5" />;
    case "document_uploaded":
      return <Upload className="h-3.5 w-3.5" />;
    default:
      return <History className="h-3.5 w-3.5" />;
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case "created":
      return "bg-emerald-500";
    case "offer_made":
      return "bg-amber-500";
    case "assigned":
      return "bg-blue-500";
    case "status_changed":
      return "bg-purple-500";
    case "appointment_scheduled":
      return "bg-cyan-500";
    default:
      return "bg-content-tertiary";
  }
}

function ActivityItem({ activity }: { activity: ActivityLogEntry }) {
  const message = formatActivityMessage(activity);
  const userName = activity.user?.full_name || activity.user?.email || "Unknown User";
  
  return (
    <div className="flex gap-3 group">
      {/* Timeline line and icon */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center text-white",
          getActionColor(activity.action)
        )}>
          {getActionIcon(activity.action)}
        </div>
        <div className="w-px flex-1 bg-border-subtle group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start gap-2">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarFallback className="text-tiny bg-surface-secondary text-content-secondary">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-small font-medium text-content">{userName}</span>
              <span className="text-tiny text-content-tertiary">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-small text-content-secondary mt-0.5">
              {message}
            </p>
            
            {/* Show changes details if available */}
            {activity.changes && Object.keys(activity.changes).length > 0 && (
              <div className="mt-2 p-2 rounded-small bg-surface-secondary">
                {Object.entries(activity.changes).map(([field, change]) => (
                  <div key={field} className="flex items-center gap-2 text-tiny">
                    <span className="text-content-tertiary capitalize">{field}:</span>
                    <span className="text-content-secondary line-through">
                      {String(change.old)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-content-tertiary" />
                    <span className="text-content font-medium">
                      {String(change.new)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityTimeline({ propertyId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = usePropertyActivity(propertyId);

  if (isLoading) {
    return (
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card variant="default" padding="lg">
        <div className="text-center py-8">
          <History className="h-10 w-10 mx-auto mb-3 text-content-tertiary opacity-50" />
          <p className="text-small text-content-secondary">No activity recorded yet</p>
          <p className="text-tiny text-content-tertiary mt-1">
            Activity will appear here as you work on this property
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 font-semibold text-content">Activity</h3>
        <Badge variant="secondary" size="sm">
          {activities.length} events
        </Badge>
      </div>

      <div className="space-y-0">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </Card>
  );
}

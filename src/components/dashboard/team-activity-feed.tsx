import * as React from "react";
import { Link } from "react-router-dom";
import { useTeamActivity, formatActivityMessage, type ActivityLogEntry } from "@/hooks/useActivityLog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import { Activity, ArrowRight } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TeamActivityFeedProps {
  limit?: number;
  className?: string;
}

export function TeamActivityFeed({ limit = 10, className }: TeamActivityFeedProps) {
  const { data: activities, isLoading } = useTeamActivity(limit);

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-accent" />
          <h3 className="text-h4 font-semibold text-content">Team Activity</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/activity" className="flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="text-center py-6">
          <Activity className="h-8 w-8 mx-auto mb-2 text-content-tertiary opacity-50" />
          <p className="text-small text-content-tertiary">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityFeedItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ActivityFeedItem({ activity }: { activity: ActivityLogEntry }) {
  const message = formatActivityMessage(activity);
  const userName = activity.user?.full_name || activity.user?.email || "Unknown";

  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarFallback className="text-tiny bg-brand-accent/10 text-brand-accent">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-small text-content">
          <span className="font-medium">{userName}</span>{" "}
          <span className="text-content-secondary">{message.toLowerCase()}</span>
        </p>
        <p className="text-tiny text-content-tertiary">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

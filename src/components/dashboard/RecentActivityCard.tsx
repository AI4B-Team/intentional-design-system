import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Plus,
  Send,
  FileText,
  Calendar,
  UserCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  description: string;
  relativeTime: string;
  propertyId?: string;
}

function ActivityItem({ activity, onClick }: { activity: Activity; onClick: () => void }) {
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    property_added: { icon: Plus, color: "bg-success/10 text-success" },
    offer_sent: { icon: Send, color: "bg-accent/10 text-accent" },
    response_received: { icon: FileText, color: "bg-warning/10 text-warning" },
    appointment_scheduled: { icon: Calendar, color: "bg-info/10 text-info" },
    status_changed: { icon: UserCheck, color: "bg-chart-4/10 text-chart-4" },
  };

  const { icon: Icon, color } = iconMap[activity.type] || { icon: FileText, color: "bg-muted text-muted-foreground" };

  return (
    <div
      className="flex items-start gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group"
      onClick={onClick}
    >
      <div className={cn("p-2 rounded-lg shadow-sm transition-transform duration-150 group-hover:scale-105", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small text-foreground line-clamp-2 group-hover:text-primary transition-colors">{activity.description}</p>
        <p className="text-tiny text-muted-foreground mt-1">{activity.relativeTime}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-150 mt-1 translate-x-2 group-hover:translate-x-0" />
    </div>
  );
}

interface RecentActivityCardProps {
  activities: Activity[] | undefined;
  isLoading: boolean;
}

export function RecentActivityCard({ activities, isLoading }: RecentActivityCardProps) {
  const navigate = useNavigate();

  return (
    <Card variant="default" padding="none" className="overflow-hidden flex flex-col h-[420px]">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-body font-semibold text-foreground">Recent Activity</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            {activities?.slice(0, 4).map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onClick={() => activity.propertyId && navigate(`/properties/${activity.propertyId}`)}
              />
            ))}
          </div>
        )}
      </div>
      <div
        className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors shrink-0"
        onClick={() => navigate("/activity")}
      >
        <span>View All Activity</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Card>
  );
}

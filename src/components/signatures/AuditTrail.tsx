import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Shield,
  UserPlus,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AuditEvent } from "@/types/signing-workflow";

const actionIconMap: Record<string, React.ElementType> = {
  created: FileText,
  sent: Send,
  viewed: Eye,
  signed: CheckCircle,
  declined: XCircle,
  reminder_sent: RefreshCw,
  voided: Ban,
  signer_added: UserPlus,
  expired: Clock,
};

const actionColorMap: Record<string, string> = {
  created: "text-muted-foreground",
  sent: "text-blue-600",
  viewed: "text-amber-600",
  signed: "text-success",
  declined: "text-destructive",
  reminder_sent: "text-brand",
  voided: "text-muted-foreground",
  signer_added: "text-purple-600",
  expired: "text-muted-foreground",
};

interface AuditTrailProps {
  events: AuditEvent[];
}

export function AuditTrail({ events }: AuditTrailProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const Icon = actionIconMap[event.action] || FileText;
        const color = actionColorMap[event.action] || "text-muted-foreground";
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn("h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border border-border-subtle bg-white", color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border-subtle min-h-[16px]" />}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{event.actor}</span>
                <span className="text-xs text-muted-foreground">{event.action.replace(/_/g, " ")}</span>
              </div>
              {event.details && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/70">
                <span>{format(event.timestamp, "MMM d, yyyy · h:mm a")}</span>
                {event.ipAddress && <span>· IP: {event.ipAddress}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

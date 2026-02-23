import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Clock,
  AlertTriangle,
  Send,
  CheckCircle,
  Calendar,
  RefreshCw,
  Timer,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInHours, differenceInDays, addDays } from "date-fns";

interface ReminderEvent {
  id: string;
  requestId: string;
  documentName: string;
  recipientName: string;
  recipientEmail: string;
  type: "auto_reminder" | "expiration_warning" | "expired" | "overdue";
  scheduledAt: Date;
  sentAt?: Date;
  status: "pending" | "sent" | "skipped";
}

interface ExpiringRequest {
  id: string;
  documentName: string;
  recipientName: string;
  expiresAt: Date;
  remindersSent: number;
  maxReminders: number;
  lastReminderAt?: Date;
  status: "pending" | "viewed" | "overdue";
}

// Mock data
const mockReminders: ReminderEvent[] = [
  { id: "r1", requestId: "1", documentName: "Purchase Agreement - 123 Main St", recipientName: "John Smith", recipientEmail: "john.smith@email.com", type: "auto_reminder", scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000), status: "pending" },
  { id: "r2", requestId: "5", documentName: "Addendum - 321 Elm St", recipientName: "David Lee", recipientEmail: "david.lee@email.com", type: "expiration_warning", scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), status: "pending" },
  { id: "r3", requestId: "1", documentName: "Purchase Agreement - 123 Main St", recipientName: "John Smith", recipientEmail: "john.smith@email.com", type: "auto_reminder", scheduledAt: new Date(Date.now() - 48 * 60 * 60 * 1000), sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000), status: "sent" },
];

const mockExpiring: ExpiringRequest[] = [
  { id: "1", documentName: "Purchase Agreement - 123 Main St", recipientName: "John Smith", expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000), remindersSent: 1, maxReminders: 5, lastReminderAt: new Date(Date.now() - 48 * 60 * 60 * 1000), status: "viewed" },
  { id: "5", documentName: "Addendum - 321 Elm St", recipientName: "David Lee", expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), remindersSent: 0, maxReminders: 5, status: "pending" },
];

interface ReminderManagerProps {
  onSendReminder?: (requestId: string) => void;
  onExtendExpiration?: (requestId: string, days: number) => void;
}

export function ReminderManager({ onSendReminder, onExtendExpiration }: ReminderManagerProps) {
  const [tab, setTab] = React.useState<"upcoming" | "expiring" | "history">("upcoming");

  const upcoming = mockReminders.filter((r) => r.status === "pending");
  const history = mockReminders.filter((r) => r.status === "sent");

  const typeConfig = {
    auto_reminder: { label: "Auto Reminder", color: "text-brand", icon: Bell, bgColor: "bg-brand/10" },
    expiration_warning: { label: "Expiration Warning", color: "text-warning", icon: AlertTriangle, bgColor: "bg-warning/10" },
    expired: { label: "Expired", color: "text-destructive", icon: Clock, bgColor: "bg-destructive/10" },
    overdue: { label: "Overdue", color: "text-destructive", icon: Timer, bgColor: "bg-destructive/10" },
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle">
        {([
          { value: "upcoming" as const, label: "Upcoming", count: upcoming.length },
          { value: "expiring" as const, label: "Expiring Soon", count: mockExpiring.length },
          { value: "history" as const, label: "History", count: history.length },
        ]).map((t) => (
          <button
            key={t.value}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5",
              tab === t.value
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            {t.count > 0 && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{t.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Upcoming Reminders */}
      {tab === "upcoming" && (
        <div className="space-y-2">
          {upcoming.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <BellOff className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No upcoming reminders
            </div>
          )}
          {upcoming.map((reminder) => {
            const config = typeConfig[reminder.type];
            const Icon = config.icon;
            const hoursUntil = differenceInHours(reminder.scheduledAt, new Date());
            return (
              <Card key={reminder.id} padding="md" className="flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", config.bgColor)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{reminder.documentName}</p>
                  <p className="text-xs text-muted-foreground">
                    To: {reminder.recipientName} · Scheduled {hoursUntil > 0 ? `in ${hoursUntil}h` : "now"}
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                  {config.label}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 h-7 text-xs"
                  onClick={() => onSendReminder?.(reminder.requestId)}
                >
                  <Send className="h-3 w-3" />
                  Send Now
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Expiring Soon */}
      {tab === "expiring" && (
        <div className="space-y-2">
          {mockExpiring.map((req) => {
            const hoursLeft = differenceInHours(req.expiresAt, new Date());
            const daysLeft = differenceInDays(req.expiresAt, new Date());
            const isUrgent = hoursLeft <= 48;
            return (
              <Card key={req.id} padding="md" className={cn("flex items-center gap-3", isUrgent && "border-destructive/30")}>
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", isUrgent ? "bg-destructive/10" : "bg-warning/10")}>
                  <Clock className={cn("h-4 w-4", isUrgent ? "text-destructive" : "text-warning")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{req.documentName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{req.recipientName}</span>
                    <span>·</span>
                    <span>Reminders: {req.remindersSent}/{req.maxReminders}</span>
                    {req.lastReminderAt && (
                      <>
                        <span>·</span>
                        <span>Last: {format(req.lastReminderAt, "MMM d")}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn("text-sm font-semibold", isUrgent ? "text-destructive" : "text-warning")}>
                    {daysLeft > 0 ? `${daysLeft}d left` : `${hoursLeft}h left`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{format(req.expiresAt, "MMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 h-7 text-xs"
                    onClick={() => onSendReminder?.(req.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Remind
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 h-7 text-xs"
                    onClick={() => onExtendExpiration?.(req.id, 7)}
                  >
                    <Calendar className="h-3 w-3" />
                    +7d
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="space-y-2">
          {history.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No reminder history yet
            </div>
          )}
          {history.map((reminder) => {
            const config = typeConfig[reminder.type];
            const Icon = config.icon;
            return (
              <Card key={reminder.id} padding="md" className="flex items-center gap-3 opacity-70">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", config.bgColor)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{reminder.documentName}</p>
                  <p className="text-xs text-muted-foreground">
                    To: {reminder.recipientName}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sent
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {reminder.sentAt ? format(reminder.sentAt, "MMM d, h:mm a") : ""}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

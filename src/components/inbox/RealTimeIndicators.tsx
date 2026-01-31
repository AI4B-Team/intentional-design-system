import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCheck,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface RealTimeIndicatorsProps {
  isConnected: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  unreadCount: number;
  pendingActions: number;
}

export function RealTimeIndicators({
  isConnected,
  lastSync,
  isSyncing,
  unreadCount,
  pendingActions,
}: RealTimeIndicatorsProps) {
  return (
    <div className="flex items-center gap-3 text-tiny">
      {/* Connection Status */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full",
        isConnected 
          ? "bg-success/10 text-success" 
          : "bg-destructive/10 text-destructive"
      )}>
        {isConnected ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>

      {/* Sync Status */}
      {isSyncing ? (
        <div className="flex items-center gap-1 text-content-tertiary">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Syncing...</span>
        </div>
      ) : lastSync && (
        <div className="flex items-center gap-1 text-content-tertiary">
          <RefreshCw className="h-3 w-3" />
          <span>
            {formatDistanceToNow(lastSync, { addSuffix: true })}
          </span>
        </div>
      )}

      {/* Pending Actions */}
      {pendingActions > 0 && (
        <div className="flex items-center gap-1 text-warning">
          <Clock className="h-3 w-3" />
          <span>{pendingActions} pending</span>
        </div>
      )}

      {/* Unread Count */}
      {unreadCount > 0 && (
        <Badge variant="default" size="sm" className="animate-pulse">
          {unreadCount} new
        </Badge>
      )}
    </div>
  );
}

interface DeliveryStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date;
}

export function DeliveryStatus({ status, timestamp }: DeliveryStatusProps) {
  const config = {
    sending: { 
      icon: Loader2, 
      label: 'Sending...', 
      color: 'text-content-tertiary',
      animate: true 
    },
    sent: { 
      icon: CheckCheck, 
      label: 'Sent', 
      color: 'text-content-tertiary',
      animate: false 
    },
    delivered: { 
      icon: CheckCheck, 
      label: 'Delivered', 
      color: 'text-info',
      animate: false 
    },
    read: { 
      icon: CheckCheck, 
      label: 'Read', 
      color: 'text-success',
      animate: false 
    },
    failed: { 
      icon: WifiOff, 
      label: 'Failed', 
      color: 'text-destructive',
      animate: false 
    },
  };

  const { icon: Icon, label, color, animate } = config[status];

  return (
    <div className={cn("flex items-center gap-1 text-tiny", color)}>
      <Icon className={cn("h-3 w-3", animate && "animate-spin")} />
      <span>{label}</span>
      {timestamp && (
        <span className="text-content-tertiary">
          · {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      )}
    </div>
  );
}

interface TypingIndicatorProps {
  contactName: string;
}

export function TypingIndicator({ contactName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 text-small text-content-secondary animate-in fade-in duration-300">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-content-tertiary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-content-tertiary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-content-tertiary animate-bounce" />
      </div>
      <span>{contactName} is typing...</span>
    </div>
  );
}

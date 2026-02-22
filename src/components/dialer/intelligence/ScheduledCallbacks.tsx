import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Clock, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

interface Callback {
  id: string;
  name: string;
  reason: string;
  lastOutcome: string;
  time: string;
  overdue?: boolean;
}

const MOCK_CALLBACKS: { today: Callback[]; tomorrow: Callback[]; overdue: Callback[] } = {
  overdue: [
    { id: "cb0", name: "David Park", reason: "Requested callback", lastOutcome: "Interested — needs numbers", time: "Yesterday 3 PM", overdue: true },
  ],
  today: [
    { id: "cb1", name: "Marcus Williams", reason: "Follow up on offer", lastOutcome: "Sent offer range", time: "2:00 PM" },
    { id: "cb2", name: "Jennifer Lee", reason: "Counter-offer discussion", lastOutcome: "Counter at $285k", time: "4:30 PM" },
  ],
  tomorrow: [
    { id: "cb3", name: "Mike Williams", reason: "Close timeline discussion", lastOutcome: "Needs 30-day close", time: "10:00 AM" },
  ],
};

export function ScheduledCallbacks({ compact = false }: { compact?: boolean }) {
  const handleCallNow = (name: string) => {
    toast.info(`Calling ${name}...`);
  };

  const handleAddAllToQueue = () => {
    const total = MOCK_CALLBACKS.overdue.length + MOCK_CALLBACKS.today.length;
    toast.success(`${total} callbacks added to dial queue`);
  };

  const renderCallback = (cb: Callback) => (
    <div
      key={cb.id}
      className={cn(
        "flex items-center gap-2.5 py-2 group",
        cb.overdue && "text-destructive"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground truncate">{cb.name}</div>
        <div className="text-[10px] text-muted-foreground truncate">{cb.reason}</div>
        {!compact && (
          <div className="text-[10px] text-muted-foreground/70 truncate">Last: {cb.lastOutcome}</div>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={cn(
          "text-[10px] tabular-nums",
          cb.overdue ? "text-destructive font-semibold" : "text-muted-foreground"
        )}>
          {cb.overdue && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
          {cb.time}
        </span>
        <button
          onClick={() => handleCallNow(cb.name)}
          className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded border border-border text-[10px] font-medium text-primary hover:bg-primary/5 transition-all"
        >
          Call
        </button>
      </div>
    </div>
  );

  const hasCallbacks = MOCK_CALLBACKS.overdue.length + MOCK_CALLBACKS.today.length + MOCK_CALLBACKS.tomorrow.length > 0;

  if (!hasCallbacks) {
    return (
      <div className="text-xs text-muted-foreground text-center py-3">
        No scheduled callbacks
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {MOCK_CALLBACKS.overdue.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-destructive tracking-wider uppercase mb-1 flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5" /> Overdue
          </div>
          {MOCK_CALLBACKS.overdue.map(renderCallback)}
        </div>
      )}
      {MOCK_CALLBACKS.today.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">Today</div>
          {MOCK_CALLBACKS.today.map(renderCallback)}
        </div>
      )}
      {!compact && MOCK_CALLBACKS.tomorrow.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">Tomorrow</div>
          {MOCK_CALLBACKS.tomorrow.map(renderCallback)}
        </div>
      )}
      <button
        onClick={handleAddAllToQueue}
        className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-border text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
      >
        <Plus className="h-3 w-3" /> Add All to Dial Queue
      </button>
    </div>
  );
}

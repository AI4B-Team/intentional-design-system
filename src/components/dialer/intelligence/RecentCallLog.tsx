import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Phone, PhoneOff, Voicemail, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RecentCall {
  id: string;
  name: string;
  status: "connected" | "no_answer" | "voicemail" | "busy";
  duration?: string;
  time: string;
}

const MOCK_RECENT_CALLS: RecentCall[] = [
  { id: "rc1", name: "Robert Martinez", status: "connected", duration: "5:19", time: "10:32 AM" },
  { id: "rc2", name: "Jennifer Lee", status: "voicemail", time: "10:15 AM" },
  { id: "rc3", name: "David Park", status: "no_answer", time: "9:58 AM" },
  { id: "rc4", name: "Angela Torres", status: "connected", duration: "12:40", time: "9:30 AM" },
  { id: "rc5", name: "Tom Bradley", status: "no_answer", time: "9:12 AM" },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  connected: { icon: Phone, color: "text-success", label: "Connected" },
  no_answer: { icon: PhoneOff, color: "text-muted-foreground", label: "No Answer" },
  voicemail: { icon: Voicemail, color: "text-warning", label: "Voicemail" },
  busy: { icon: PhoneOff, color: "text-destructive", label: "Busy" },
};

export function RecentCallLog() {
  const navigate = useNavigate();

  return (
    <div className="space-y-1">
      {MOCK_RECENT_CALLS.map((call) => {
        const config = STATUS_CONFIG[call.status];
        const Icon = config.icon;
        return (
          <div
            key={call.id}
            className="flex items-center gap-2.5 py-1.5 group"
          >
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", 
              call.status === "connected" ? "bg-success/10" : "bg-muted"
            )}>
              <Icon className={cn("h-2.5 w-2.5", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-foreground truncate">{call.name}</div>
            </div>
            {call.duration && (
              <span className="text-[10px] text-muted-foreground tabular-nums">{call.duration}</span>
            )}
            <span className="text-[10px] text-muted-foreground/70 tabular-nums flex-shrink-0">{call.time}</span>
          </div>
        );
      })}
      <button
        onClick={() => navigate("/dialer/history")}
        className="w-full mt-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
      >
        View Call History <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}

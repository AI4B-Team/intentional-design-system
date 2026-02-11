import * as React from "react";
import { cn } from "@/lib/utils";
import { PhoneCall, Maximize2, X } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import { CallControls, formatCallDuration } from "./CallControls";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LiveCallMiniCard({ className }: { className?: string }) {
  const { isCallActive, callStatus, currentContact, callDuration, setDisplayMode, dismissCall } = useCallState();

  if (!isCallActive && callStatus !== "ended") return null;

  if (callStatus === "ended") {
    return (
      <div className={cn("p-3 bg-muted/50 border border-border rounded-lg", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Call Ended</p>
              <p className="text-xs text-muted-foreground">{currentContact?.name} · {formatCallDuration(callDuration)}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={dismissCall}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("p-3 bg-background border border-primary/20 rounded-lg shadow-sm", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <PhoneCall className={cn("h-4 w-4 text-primary", callStatus === "ringing" && "animate-pulse")} />
            </div>
            <div>
              <p className="text-sm font-medium">{currentContact?.name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {callStatus === "ringing" ? "Ringing..." : formatCallDuration(callDuration)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CallControls compact />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setDisplayMode("fullscreen")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Fullscreen</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

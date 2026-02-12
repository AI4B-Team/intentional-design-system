import * as React from "react";
import { cn } from "@/lib/utils";
import { PhoneCall, Mic, MicOff, Pause, Play, PhoneOff, Maximize2, Circle } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import { formatCallDuration } from "./CallControls";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingCallBanner() {
  const {
    isCallActive,
    callStatus,
    currentContact,
    callDuration,
    displayMode,
    isMuted,
    isOnHold,
    isRecording,
    toggleMute,
    toggleHold,
    toggleRecording,
    endCall,
    setDisplayMode,
  } = useCallState();

  // Only show when there's an active call and the user isn't already viewing it fullscreen
  if (!isCallActive) return null;
  if (displayMode === "fullscreen") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="flex items-center gap-3 bg-foreground text-background rounded-xl px-4 py-2.5 shadow-2xl border border-border/10">
        {/* Pulsing indicator + contact info */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <PhoneCall className="h-4 w-4 text-primary-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-background max-w-[140px] truncate">
              {currentContact?.name || "Unknown"}
            </span>
            <span className="text-xs font-mono text-background/70 tabular-nums">
              {callStatus === "ringing" ? "Ringing..." : formatCallDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-background/20" />

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn("h-8 w-8 hover:bg-background/10", isMuted && "bg-destructive/20")}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4 text-destructive" />
                ) : (
                  <Mic className="h-4 w-4 text-background/80" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isMuted ? "Unmute" : "Mute"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn("h-8 w-8 hover:bg-background/10", isOnHold && "bg-warning/20")}
                onClick={toggleHold}
              >
                {isOnHold ? (
                  <Play className="h-4 w-4 text-warning" />
                ) : (
                  <Pause className="h-4 w-4 text-background/80" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isOnHold ? "Resume" : "Hold"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn("h-8 w-8 hover:bg-background/10", isRecording && "bg-destructive/20 animate-[pulse_3s_ease-in-out_infinite]")}
                onClick={toggleRecording}
              >
                <Circle className={cn("h-4 w-4", isRecording ? "text-destructive fill-destructive" : "text-background/80")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isRecording ? "Stop Recording" : "Record"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-destructive/20 hover:bg-destructive/30"
                onClick={endCall}
              >
                <PhoneOff className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">End Call</TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-background/20" />

        {/* Return to call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs font-semibold text-primary-foreground hover:bg-background/10"
              onClick={() => setDisplayMode("fullscreen")}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Return
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Return To Call</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

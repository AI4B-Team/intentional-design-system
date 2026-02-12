import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Pause, Play, Phone, PhoneOff, Circle, Volume2 } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CallControlsProps {
  compact?: boolean;
  className?: string;
}

function ControlButton({
  tooltip,
  onClick,
  className,
  children,
}: {
  tooltip: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" className={className} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function CallControls({ compact = false, className }: CallControlsProps) {
  const { isMuted, isOnHold, isRecording, toggleMute, toggleHold, toggleRecording, endCall } = useCallState();

  const iconSize = compact ? "h-4 w-4" : "h-5 w-5";
  const btnSize = compact ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ControlButton
        tooltip={isMuted ? "Unmute" : "Mute"}
        onClick={toggleMute}
        className={cn(btnSize, isMuted && "bg-destructive/10")}
      >
        {isMuted ? <MicOff className={cn(iconSize, "text-destructive")} /> : <Mic className={iconSize} />}
      </ControlButton>

      <ControlButton
        tooltip={isOnHold ? "Resume" : "Hold"}
        onClick={toggleHold}
        className={cn(btnSize, isOnHold && "bg-warning/10")}
      >
        {isOnHold ? <Play className={cn(iconSize, "text-warning")} /> : <Pause className={iconSize} />}
      </ControlButton>

      <ControlButton
        tooltip={isRecording ? "Stop Recording" : "Record"}
        onClick={toggleRecording}
        className={cn(btnSize, isRecording && "bg-destructive/10 animate-[pulse_3s_ease-in-out_infinite]")}
      >
        <Circle className={cn(iconSize, isRecording ? "text-destructive fill-destructive" : "text-muted-foreground")} />
      </ControlButton>

      <ControlButton
        tooltip="End Call"
        onClick={endCall}
        className={cn(btnSize, "bg-destructive/10 hover:bg-destructive/20")}
      >
        <PhoneOff className={cn(iconSize, "text-destructive")} />
      </ControlButton>
    </div>
  );
}

export function formatCallDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

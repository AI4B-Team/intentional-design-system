import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Pause, Play, Phone, PhoneOff, Circle, Volume2 } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";

interface CallControlsProps {
  compact?: boolean;
  className?: string;
}

export function CallControls({ compact = false, className }: CallControlsProps) {
  const { isMuted, isOnHold, isRecording, toggleMute, toggleHold, toggleRecording, endCall } = useCallState();

  const iconSize = compact ? "h-4 w-4" : "h-5 w-5";
  const btnSize = compact ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="icon"
        variant="ghost"
        className={cn(btnSize, isMuted && "bg-destructive/10")}
        onClick={toggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className={cn(iconSize, "text-destructive")} /> : <Mic className={iconSize} />}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className={cn(btnSize, isOnHold && "bg-warning/10")}
        onClick={toggleHold}
        title={isOnHold ? "Resume" : "Hold"}
      >
        {isOnHold ? <Play className={cn(iconSize, "text-warning")} /> : <Pause className={iconSize} />}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className={cn(btnSize, isRecording && "bg-destructive/10")}
        onClick={toggleRecording}
        title={isRecording ? "Stop Recording" : "Record"}
      >
        <Circle className={cn(iconSize, isRecording ? "text-destructive fill-destructive" : "text-muted-foreground")} />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className={cn(btnSize, "bg-destructive/10 hover:bg-destructive/20")}
        onClick={endCall}
        title="End Call"
      >
        <PhoneOff className={cn(iconSize, "text-destructive")} />
      </Button>
    </div>
  );
}

export function formatCallDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

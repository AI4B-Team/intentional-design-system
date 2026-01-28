import { Button } from "@/components/ui/button";
import { Play, StopCircle, Pause } from "lucide-react";
import { formatDuration } from "@/lib/format-duration";

interface D4DPauseOverlayProps {
  duration: number;
  onResume: () => void;
  onEnd: () => void;
}

export function D4DPauseOverlay({ duration, onResume, onEnd }: D4DPauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      {/* Pause Icon */}
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Pause className="h-10 w-10 text-muted-foreground" />
      </div>

      {/* Status */}
      <h2 className="text-2xl font-bold mb-2">Session Paused</h2>
      <p className="text-muted-foreground mb-2">GPS tracking stopped to save battery</p>
      
      {/* Duration */}
      <div className="font-mono text-4xl font-bold mb-8 tabular-nums">
        {formatDuration(duration)}
      </div>

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-lg gap-2"
          onClick={onResume}
        >
          <Play className="h-5 w-5" />
          Resume Driving
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12 gap-2"
          onClick={onEnd}
        >
          <StopCircle className="h-5 w-5" />
          End Session
        </Button>
      </div>
    </div>
  );
}

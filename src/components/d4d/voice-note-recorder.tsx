import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, X } from "lucide-react";
import { formatDuration } from "@/lib/format-duration";
import { cn } from "@/lib/utils";

interface VoiceNoteRecorderProps {
  isRecording: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onCancel?: () => void;
  variant?: "compact" | "fullscreen";
  className?: string;
}

export function VoiceNoteRecorder({
  isRecording,
  duration,
  onStart,
  onStop,
  onCancel,
  variant = "compact",
  className
}: VoiceNoteRecorderProps) {
  // Auto-stop after 60 seconds
  useEffect(() => {
    if (isRecording && duration >= 60) {
      onStop();
    }
  }, [isRecording, duration, onStop]);

  const handleToggle = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  if (variant === "fullscreen" && isRecording) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center"
        onClick={onStop}
      >
        {/* Cancel button */}
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <X className="h-6 w-6" />
          </Button>
        )}

        {/* Pulsing mic icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
            <Mic className="h-16 w-16 text-destructive" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
        </div>

        {/* Recording text */}
        <p className="text-xl font-medium text-destructive mb-2">Recording...</p>
        
        {/* Duration */}
        <p className="text-4xl font-mono font-bold mb-8 tabular-nums">
          {formatDuration(duration)}
        </p>

        {/* Sound wave visualization */}
        <div className="flex items-center gap-1 h-12 mb-8">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-destructive rounded-full animate-pulse"
              style={{
                height: `${20 + Math.sin(Date.now() / 200 + i) * 15 + Math.random() * 10}px`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>

        {/* Instruction */}
        <p className="text-sm text-muted-foreground">
          Tap anywhere to stop recording
        </p>
        
        {/* Max duration warning */}
        {duration >= 50 && (
          <p className="text-xs text-warning mt-2">
            Auto-stop in {60 - duration} seconds
          </p>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="lg"
        className={cn(
          "h-16 w-16 rounded-full transition-all",
          isRecording && "animate-pulse"
        )}
        onClick={handleToggle}
      >
        {isRecording ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {isRecording ? (
        <div className="flex items-center gap-2 text-destructive">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="font-mono text-sm">{formatDuration(duration)}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Tap to record</span>
      )}
    </div>
  );
}

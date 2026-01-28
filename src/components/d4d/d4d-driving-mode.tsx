import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Camera, 
  Mic, 
  FileText, 
  Pause, 
  Play,
  Plus,
  Compass,
  Navigation,
  Gauge
} from "lucide-react";
import { formatDuration, formatMiles, formatSpeed, formatHeading } from "@/lib/format-duration";
import { D4DTagPropertySheet } from "./d4d-tag-property-sheet";
import { D4DPauseOverlay } from "./d4d-pause-overlay";
import { D4DEndSessionDialog } from "./d4d-end-session-dialog";
import { D4DMapView } from "./d4d-map-view";
import { cn } from "@/lib/utils";

interface DrivingSession {
  id: string;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  totalMiles: number;
  propertiesTagged: number;
  photosTaken: number;
  routeCoordinates: Array<{ lat: number; lng: number; timestamp: string }>;
}

interface CurrentLocation {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  altitude: number | null;
}

interface D4DDrivingModeProps {
  session: DrivingSession;
  isPaused: boolean;
  duration: number;
  activeDuration: number;
  currentLocation: CurrentLocation;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onPropertyTagged: () => void;
  onPhotoTaken: () => void;
}

export function D4DDrivingMode({
  session,
  isPaused,
  duration,
  activeDuration,
  currentLocation,
  onPause,
  onResume,
  onEnd,
  onPropertyTagged,
  onPhotoTaken
}: D4DDrivingModeProps) {
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const handleBackPress = () => {
    setShowEndDialog(true);
  };

  const handleTagProperty = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setShowTagSheet(true);
  };

  const handlePropertySaved = useCallback(() => {
    onPropertyTagged();
    setShowTagSheet(false);
    // Haptic feedback on success
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [onPropertyTagged]);

  const handleVoiceNote = () => {
    setIsRecordingVoice(!isRecordingVoice);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handlePhoto = () => {
    // Trigger native camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => {
      if (input.files?.length) {
        onPhotoTaken();
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header Bar */}
      <header className="h-14 bg-card border-b flex items-center px-3 gap-3 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleBackPress}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'Driving Session'}
          </p>
        </div>

        <Badge 
          variant={isPaused ? "secondary" : "default"} 
          className="font-mono text-sm tabular-nums"
        >
          {formatDuration(duration)}
        </Badge>
      </header>

      {/* Stats Bar */}
      <div className="h-12 bg-card/80 backdrop-blur border-b flex items-center justify-around px-4 z-10">
        <div className="flex items-center gap-1.5">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formatMiles(session.totalMiles)}</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{session.propertiesTagged} tagged</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{session.photosTaken} photos</span>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        <D4DMapView
          currentLocation={currentLocation}
          routeCoordinates={session.routeCoordinates}
          isPaused={isPaused}
        />

        {/* Speed & Heading Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-card/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono font-medium">
              {formatSpeed(currentLocation.speed)}
            </span>
          </div>
          <div className="bg-card/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono font-medium">
              {formatHeading(currentLocation.heading)}
            </span>
          </div>
        </div>

        {/* GPS Accuracy Indicator */}
        {currentLocation.accuracy && (
          <div className="absolute top-4 left-4">
            <Badge 
              variant="outline" 
              className={cn(
                "bg-card/90 backdrop-blur",
                currentLocation.accuracy < 10 ? "text-success" : 
                currentLocation.accuracy < 30 ? "text-warning" : "text-destructive"
              )}
            >
              <Navigation className="h-3 w-3 mr-1" />
              ±{Math.round(currentLocation.accuracy)}m
            </Badge>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="h-20 bg-card border-t flex items-center justify-around px-4 z-10">
        <button 
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
            isRecordingVoice ? "bg-destructive/10 text-destructive" : "hover:bg-muted"
          )}
          onClick={handleVoiceNote}
        >
          <Mic className={cn("h-6 w-6", isRecordingVoice && "animate-pulse")} />
          <span className="text-xs">{isRecordingVoice ? "Stop" : "Voice"}</span>
        </button>
        
        <button 
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]"
          onClick={handlePhoto}
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs">Photo</span>
        </button>
        
        <div className="w-20" /> {/* Spacer for center button */}
        
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]">
          <FileText className="h-6 w-6" />
          <span className="text-xs">Note</span>
        </button>
        
        <button 
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]"
          onClick={isPaused ? onResume : onPause}
        >
          {isPaused ? (
            <>
              <Play className="h-6 w-6 text-success" />
              <span className="text-xs text-success">Resume</span>
            </>
          ) : (
            <>
              <Pause className="h-6 w-6" />
              <span className="text-xs">Pause</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Tag Button */}
      <button
        className={cn(
          "absolute bottom-24 left-1/2 -translate-x-1/2 z-20",
          "w-[72px] h-[72px] rounded-full",
          "bg-gradient-to-br from-orange-500 to-red-600",
          "flex items-center justify-center",
          "shadow-lg shadow-orange-500/30",
          "active:scale-95 transition-transform",
          "focus:outline-none focus:ring-4 focus:ring-orange-500/30"
        )}
        onClick={handleTagProperty}
      >
        <Plus className="h-8 w-8 text-white" />
        <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground">
          Tag Property
        </span>
      </button>

      {/* Pause Overlay */}
      {isPaused && (
        <D4DPauseOverlay
          duration={duration}
          onResume={onResume}
          onEnd={() => setShowEndDialog(true)}
        />
      )}

      {/* Tag Property Sheet */}
      <D4DTagPropertySheet
        open={showTagSheet}
        onOpenChange={setShowTagSheet}
        currentLocation={currentLocation}
        sessionId={session.id}
        onSave={handlePropertySaved}
      />

      {/* End Session Dialog */}
      <D4DEndSessionDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        duration={duration}
        miles={session.totalMiles}
        propertiesTagged={session.propertiesTagged}
        onConfirm={onEnd}
      />
    </div>
  );
}

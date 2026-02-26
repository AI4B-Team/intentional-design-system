import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Camera, 
  Mic, 
  Pause, 
  Play,
  Plus,
  Compass,
  Navigation,
  Gauge,
  StopCircle
} from "lucide-react";
import { formatDuration, formatMiles, formatSpeed, formatHeading } from "@/lib/format-duration";
import { D4DTagPropertySheet } from "./d4d-tag-property-sheet";
import { D4DPauseOverlay } from "./d4d-pause-overlay";
import { D4DEndSessionDialog } from "./d4d-end-session-dialog";
import { D4DMapView } from "./d4d-map-view";
import { VoiceNoteRecorder } from "./voice-note-recorder";
import { CameraCapture } from "./camera-capture";
import { useVoiceNote } from "@/hooks/useVoiceNote";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useOrientationLock } from "@/hooks/useOrientationLock";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [showCamera, setShowCamera] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const { reverseGeocode } = useReverseGeocode();

  // Keep screen awake during active session, release when paused
  useWakeLock(!isPaused);
  // Lock to portrait
  useOrientationLock(true);

  const {
    isRecording: isRecordingVoice,
    duration: voiceDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadVoiceNote,
    transcribeVoiceNote
  } = useVoiceNote();

  const handleBackPress = useCallback(() => {
    setShowEndDialog(true);
  }, []);

  // Quick-tag: immediately save GPS location, then offer "Add Details"
  const handleQuickTag = useCallback(async () => {
    if (navigator.vibrate) navigator.vibrate(50);

    if (!user || !currentLocation.latitude || !currentLocation.longitude) {
      toast.error("Unable to tag — no GPS fix");
      return;
    }

    try {
      // Get address in background
      const geo = await reverseGeocode(currentLocation.latitude, currentLocation.longitude);

      const propertyData = {
        user_id: user.id,
        organization_id: organizationId,
        session_id: session.id,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: geo ? `${geo.streetNumber} ${geo.streetName}` : null,
        street_number: geo?.streetNumber || null,
        street_name: geo?.streetName || null,
        city: geo?.city || null,
        state: geo?.state || null,
        zip: geo?.zip || null,
        county: geo?.county || null,
        formatted_address: geo?.formattedAddress || null,
        priority: 3,
        tagged_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("d4d_properties").insert(propertyData);
      if (error) throw error;

      onPropertyTagged();
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

      toast.success("Property Tagged! Add Details?", {
        action: {
          label: "Add Details",
          onClick: () => setShowTagSheet(true),
        },
        duration: 4000,
      });
    } catch (err) {
      console.error("Quick tag error:", err);
      toast.error("Failed to tag property");
    }
  }, [user, currentLocation, organizationId, session.id, onPropertyTagged, reverseGeocode]);

  const handlePropertySaved = useCallback(() => {
    onPropertyTagged();
    setShowTagSheet(false);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  }, [onPropertyTagged]);

  // Voice note handlers
  const handleVoiceStart = useCallback(async () => {
    const started = await startRecording();
    if (started) setShowVoiceRecorder(true);
  }, [startRecording]);

  const handleVoiceStop = useCallback(async () => {
    const result = await stopRecording();
    setShowVoiceRecorder(false);
    if (result && result.blob) {
      toast.loading("Saving voice note...");
      const url = await uploadVoiceNote(result.blob, session.id);
      if (url) {
        const transcript = await transcribeVoiceNote(url);
        await supabase.from("driving_sessions").update({
          notes_recorded: ((session as any).notesRecorded || 0) + 1,
        }).eq("id", session.id);
        toast.dismiss();
        toast.success(transcript ? "Voice Note Saved & Transcribed!" : "Voice Note Saved!");
      } else {
        toast.dismiss();
        toast.error("Failed to save voice note");
      }
    }
  }, [stopRecording, uploadVoiceNote, transcribeVoiceNote, session.id]);

  const handleVoiceCancel = useCallback(() => {
    cancelRecording();
    setShowVoiceRecorder(false);
  }, [cancelRecording]);

  const handleCameraCapture = useCallback(async (blob: Blob) => {
    toast.loading("Uploading photo...");
    try {
      const fileName = `${session.id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("d4d-photos")
        .upload(`photos/${fileName}`, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      onPhotoTaken();
      setShowCamera(false);
      toast.dismiss();
      toast.success("Photo Saved!");
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.dismiss();
      toast.error("Failed to save photo");
    }
  }, [session.id, onPhotoTaken]);

  // Memoize location display
  const locationDisplay = useMemo(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      return `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    }
    return "Acquiring GPS...";
  }, [currentLocation.latitude, currentLocation.longitude]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Top Bar: Timer + Pause/Resume — always visible */}
      <header className="bg-card border-b flex items-center justify-between px-3 py-2 z-20">
        {/* Back button — 48px tap target */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 flex-shrink-0"
          onClick={handleBackPress}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Timer — large, high-contrast, readable in sunlight */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatDuration(duration)}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Active {formatDuration(activeDuration)}
          </span>
        </div>

        {/* Pause/Resume — 48px, always visible top-right */}
        <Button
          variant={isPaused ? "default" : "outline"}
          size="icon"
          className={cn(
            "h-12 w-12 flex-shrink-0 rounded-full",
            isPaused && "bg-success hover:bg-success/90 text-success-foreground"
          )}
          onClick={isPaused ? onResume : onPause}
        >
          {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </Button>
      </header>

      {/* Location & Stats Row */}
      <div className="bg-card/80 backdrop-blur border-b px-4 py-2 z-10">
        {/* Address display — large, glanceable */}
        <p className="text-base font-semibold truncate mb-1.5">{locationDisplay}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Car className="h-4 w-4" />
            {formatMiles(session.totalMiles)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {session.propertiesTagged} Tagged
          </span>
          <span className="flex items-center gap-1.5">
            <Camera className="h-4 w-4" />
            {session.photosTaken} Photos
          </span>
          {currentLocation.speed !== null && (
            <span className="flex items-center gap-1.5 ml-auto">
              <Gauge className="h-4 w-4" />
              {formatSpeed(currentLocation.speed)}
            </span>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        <D4DMapView
          currentLocation={currentLocation}
          routeCoordinates={session.routeCoordinates}
          isPaused={isPaused}
        />

        {/* GPS Accuracy Indicator */}
        {currentLocation.accuracy && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="outline"
              className={cn(
                "bg-card/90 backdrop-blur text-xs px-2 py-1",
                currentLocation.accuracy < 10 ? "text-success" :
                currentLocation.accuracy < 30 ? "text-warning" : "text-destructive"
              )}
            >
              <Navigation className="h-3 w-3 mr-1" />
              ±{Math.round(currentLocation.accuracy)}m
            </Badge>
          </div>
        )}

        {/* Heading overlay */}
        {currentLocation.heading !== null && (
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono font-medium">
              {formatHeading(currentLocation.heading)}
            </span>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar — full width, large tap targets */}
      <div className="bg-card border-t pb-safe z-20">
        {/* Primary action: Tag Property — prominent center */}
        <div className="flex justify-center -mt-8 mb-1">
          <button
            className={cn(
              "w-[72px] h-[72px] rounded-full",
              "bg-gradient-to-br from-destructive to-destructive/80",
              "flex flex-col items-center justify-center",
              "shadow-lg shadow-destructive/30",
              "active:scale-95 transition-transform",
              "focus:outline-none focus:ring-4 focus:ring-destructive/30"
            )}
            onClick={handleQuickTag}
          >
            <Plus className="h-8 w-8 text-destructive-foreground" />
          </button>
        </div>
        <p className="text-[10px] font-semibold text-center text-muted-foreground uppercase tracking-wide -mt-0.5 mb-2">
          Tag Property
        </p>

        {/* Secondary actions row */}
        <div className="flex items-stretch px-2 pb-2 gap-2">
          <button
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-3 min-h-[56px] transition-colors",
              isRecordingVoice ? "bg-destructive/10 text-destructive" : "bg-muted/60 hover:bg-muted active:bg-muted"
            )}
            onClick={isRecordingVoice ? handleVoiceStop : handleVoiceStart}
          >
            <Mic className={cn("h-6 w-6", isRecordingVoice && "animate-pulse")} />
            <span className="text-[11px] font-medium">{isRecordingVoice ? "Stop" : "Voice"}</span>
          </button>

          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-3 min-h-[56px] bg-muted/60 hover:bg-muted active:bg-muted transition-colors"
            onClick={() => setShowCamera(true)}
          >
            <Camera className="h-6 w-6" />
            <span className="text-[11px] font-medium">Photo</span>
          </button>

          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-3 min-h-[56px] bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/20 transition-colors"
            onClick={() => setShowEndDialog(true)}
          >
            <StopCircle className="h-6 w-6" />
            <span className="text-[11px] font-medium">End</span>
          </button>
        </div>
      </div>

      {/* Voice Recorder Overlay */}
      {showVoiceRecorder && (
        <VoiceNoteRecorder
          isRecording={isRecordingVoice}
          duration={voiceDuration}
          onStart={handleVoiceStart}
          onStop={handleVoiceStop}
          onCancel={handleVoiceCancel}
          variant="fullscreen"
        />
      )}

      {/* Camera Capture */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Pause Overlay */}
      {isPaused && !showVoiceRecorder && !showCamera && (
        <D4DPauseOverlay
          duration={duration}
          onResume={onResume}
          onEnd={() => setShowEndDialog(true)}
        />
      )}

      {/* Tag Property Sheet (for "Add Details" flow) */}
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

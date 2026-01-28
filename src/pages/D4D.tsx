import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDrivingSession } from "@/hooks/useDrivingSession";
import { useDrivingSessions } from "@/hooks/useDrivingSessions";
import { D4DStartScreen } from "@/components/d4d/d4d-start-screen";
import { D4DDrivingMode } from "@/components/d4d/d4d-driving-mode";
import { D4DIncompleteSessionDialog } from "@/components/d4d/d4d-incomplete-session-dialog";

export default function D4D() {
  const navigate = useNavigate();
  const {
    session,
    isActive,
    isPaused,
    duration,
    activeDuration,
    currentLocation,
    geoError,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    incrementPropertiesTagged,
    incrementPhotosTaken
  } = useDrivingSession();

  const { useIncompleteSession, endIncompleteSession } = useDrivingSessions();
  const { data: incompleteSession } = useIncompleteSession();

  const [sessionName, setSessionName] = useState("");
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);

  // Check for incomplete session on mount
  useEffect(() => {
    if (incompleteSession && !isActive) {
      setShowIncompleteDialog(true);
    }
  }, [incompleteSession, isActive]);

  const handleStartSession = async () => {
    await startSession(sessionName || undefined);
  };

  const handleResumeIncomplete = () => {
    setShowIncompleteDialog(false);
    // Navigate to the incomplete session or resume it
    if (incompleteSession) {
      navigate(`/d4d/history/${incompleteSession.id}`);
    }
  };

  const handleEndIncomplete = async () => {
    if (incompleteSession) {
      await endIncompleteSession.mutateAsync(incompleteSession);
    }
    setShowIncompleteDialog(false);
  };

  if (!isActive || !session) {
    return (
      <>
        <D4DStartScreen
          sessionName={sessionName}
          onSessionNameChange={setSessionName}
          onStartSession={handleStartSession}
          geoError={geoError}
        />
        
        <D4DIncompleteSessionDialog
          session={incompleteSession || null}
          open={showIncompleteDialog}
          onResume={handleResumeIncomplete}
          onEnd={handleEndIncomplete}
        />
      </>
    );
  }

  return (
    <D4DDrivingMode
      session={session}
      isPaused={isPaused}
      duration={duration}
      activeDuration={activeDuration}
      currentLocation={currentLocation}
      onPause={pauseSession}
      onResume={resumeSession}
      onEnd={endSession}
      onPropertyTagged={incrementPropertiesTagged}
      onPhotoTaken={incrementPhotosTaken}
    />
  );
}

import { useState } from "react";
import { useDrivingSession } from "@/hooks/useDrivingSession";
import { D4DStartScreen } from "@/components/d4d/d4d-start-screen";
import { D4DDrivingMode } from "@/components/d4d/d4d-driving-mode";

export default function D4D() {
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

  const [sessionName, setSessionName] = useState("");

  const handleStartSession = async () => {
    await startSession(sessionName || undefined);
  };

  if (!isActive || !session) {
    return (
      <D4DStartScreen
        sessionName={sessionName}
        onSessionNameChange={setSessionName}
        onStartSession={handleStartSession}
        geoError={geoError}
      />
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

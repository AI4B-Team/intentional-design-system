import React, { useState, useEffect } from "react";
import { SCAN_PHASES } from "./d4d-scan-data";
import { cn } from "@/lib/utils";

interface D4DScanOverlayProps {
  onComplete: () => void;
}

export function D4DScanOverlay({ onComplete }: D4DScanOverlayProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [propertiesFound, setPropertiesFound] = useState(0);

  useEffect(() => {
    let phaseIdx = 0;
    let progressInterval: ReturnType<typeof setInterval>;

    const advancePhase = () => {
      if (phaseIdx >= SCAN_PHASES.length) {
        onComplete();
        return;
      }
      setCurrentPhase(phaseIdx);
      const phaseDuration = SCAN_PHASES[phaseIdx].duration;
      const startProg = (phaseIdx / SCAN_PHASES.length) * 100;
      const endProg = ((phaseIdx + 1) / SCAN_PHASES.length) * 100;
      const steps = 20;
      const stepTime = phaseDuration / steps;
      let step = 0;

      progressInterval = setInterval(() => {
        step++;
        const p = startProg + ((endProg - startProg) * step) / steps;
        setProgress(Math.min(p, 100));
        // Simulate finding properties
        setPropertiesFound(prev => prev + Math.floor(Math.random() * 40));
        if (step >= steps) {
          clearInterval(progressInterval);
          phaseIdx++;
          advancePhase();
        }
      }, stepTime);
    };

    advancePhase();
    return () => clearInterval(progressInterval);
  }, [onComplete]);

  const phase = SCAN_PHASES[currentPhase] || SCAN_PHASES[SCAN_PHASES.length - 1];

  return (
    <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border rounded-2xl shadow-2xl p-6 w-[360px] space-y-4">
        {/* Radar animation */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-destructive/20" />
            <div className="absolute inset-2 rounded-full border-2 border-destructive/30" />
            <div className="absolute inset-4 rounded-full border-2 border-destructive/40" />
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-destructive to-transparent origin-left animate-spin" style={{ animationDuration: "2s" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              {phase.icon}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm">AI D4D Scanner Active</h3>
          <p className="text-xs text-muted-foreground mt-1">{phase.label}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-destructive to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            <span>{propertiesFound.toLocaleString()} properties scanned</span>
          </div>
        </div>

        {/* Phase indicators */}
        <div className="grid grid-cols-6 gap-1">
          {SCAN_PHASES.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all",
                  idx < currentPhase
                    ? "bg-green-100 text-green-700"
                    : idx === currentPhase
                      ? "bg-destructive/10 text-destructive animate-pulse"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {idx < currentPhase ? "✓" : p.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

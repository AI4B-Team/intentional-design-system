import React, { useState, useEffect, useRef, useCallback } from "react";
import { SCAN_PHASES } from "./d4d-scan-data";
import { cn } from "@/lib/utils";
import { Pause, Play, Square, Satellite, FileSearch, Landmark, Brain, Camera, CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface D4DScanOverlayProps {
  onComplete: () => void;
  onStop?: () => void;
}

export function D4DScanOverlay({ onComplete, onStop }: D4DScanOverlayProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [propertiesFound, setPropertiesFound] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIdxRef = useRef(0);
  const stepRef = useRef(0);
  const isRunningRef = useRef(true);

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    clearCurrentInterval();
  }, [clearCurrentInterval]);

  const handleStop = useCallback(() => {
    isRunningRef.current = false;
    clearCurrentInterval();
    onStop ? onStop() : onComplete();
  }, [clearCurrentInterval, onComplete, onStop]);

  const runPhase = useCallback(() => {
    if (!isRunningRef.current) return;
    const phaseIdx = phaseIdxRef.current;
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
    let step = stepRef.current;

    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      step++;
      stepRef.current = step;
      const p = startProg + ((endProg - startProg) * step) / steps;
      setProgress(Math.min(p, 100));
      setPropertiesFound(prev => prev + Math.floor(Math.random() * 40));
      if (step >= steps) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        stepRef.current = 0;
        phaseIdxRef.current++;
        runPhase();
      }
    }, stepTime);
  }, [onComplete]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    clearCurrentInterval();
    runPhase();
  }, [clearCurrentInterval, runPhase]);

  useEffect(() => {
    runPhase();
    return () => clearCurrentInterval();
  }, [runPhase, clearCurrentInterval]);

  const phase = SCAN_PHASES[currentPhase] || SCAN_PHASES[SCAN_PHASES.length - 1];

  const PHASE_ICONS: Record<string, React.ElementType> = {
    satellite: Satellite,
    "file-search": FileSearch,
    landmark: Landmark,
    brain: Brain,
    camera: Camera,
    "check-circle": CheckCircle2,
  };

  const PhaseIcon = PHASE_ICONS[phase.icon] || CheckCircle2;

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
              <div className={cn(
                "absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-destructive to-transparent origin-left",
                isPaused ? "" : "animate-spin"
              )} style={{ animationDuration: "2s" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <PhaseIcon className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm">AI D4D Scanner {isPaused ? "Paused" : "Active"}</h3>
          <p className="text-xs text-muted-foreground mt-1">{isPaused ? "Scan paused" : phase.label}</p>
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

        {/* Pause / Resume / Stop controls */}
        <div className="flex items-center justify-center gap-2">
          {isPaused ? (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleResume}>
              <Play className="h-3.5 w-3.5" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePause}>
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
          )}
          <Button size="sm" variant="destructive" className="gap-1.5" onClick={handleStop}>
            <Square className="h-3.5 w-3.5" /> Stop
          </Button>
        </div>

        {/* Phase indicators */}
        <div className="grid grid-cols-6 gap-1">
          {SCAN_PHASES.map((p, idx) => {
            const Icon = PHASE_ICONS[p.icon] || CheckCircle2;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    idx < currentPhase
                      ? "bg-success/15 text-success"
                      : idx === currentPhase
                        ? isPaused
                          ? "bg-warning/15 text-warning"
                          : "bg-destructive/10 text-destructive animate-pulse"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {idx < currentPhase ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";
import { PhoneCall, Sparkles, Minimize2, X } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import { CallControls, formatCallDuration } from "./CallControls";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LiveCallOverlay() {
  const {
    isCallActive, callStatus, currentContact, callDuration, transcript,
    sentiment, sentimentScore, currentCallPhase, aiSuggestions,
    displayMode, setDisplayMode, dismissCall,
    isDialerSessionActive, autoAdvanceCountdown, cancelAutoAdvance, advanceDialerQueue, pauseDialerSession,
  } = useCallState();

  if (displayMode !== "fullscreen") return null;
  if (!isCallActive && callStatus !== "ended") return null;

  const PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];
  const phaseIdx = PHASES.indexOf(currentCallPhase);

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <PhoneCall className={cn("h-6 w-6 text-primary-foreground", callStatus === "ringing" && "animate-pulse")} />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{currentContact?.name || "Unknown"}</div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {currentContact?.phone && <span>{currentContact.phone}</span>}
              {currentContact?.address && <span>· {currentContact.address}</span>}
              <span className="font-mono font-semibold">
                {callStatus === "ringing" ? "Ringing..." : callStatus === "ended" ? "Ended" : formatCallDuration(callDuration)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCallActive && <CallControls />}
          <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => {
            if (callStatus === "ended") { dismissCall(); }
            else { setDisplayMode("mini"); }
          }}>
            {callStatus === "ended" ? <X className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Post-call auto-advance */}
      {callStatus === "ended" && isDialerSessionActive && autoAdvanceCountdown !== null && (
        <div className="px-6 py-3 bg-primary/5 border-b border-primary/20 flex items-center justify-between">
          <p className="text-sm text-foreground">
            Auto-dialing next contact in <span className="font-bold text-primary">{autoAdvanceCountdown}s</span>
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={cancelAutoAdvance}>Pause</Button>
            <Button size="sm" onClick={advanceDialerQueue}>Skip to Next</Button>
          </div>
        </div>
      )}

      {callStatus === "ended" && !isDialerSessionActive && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <PhoneCall className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">Call Ended</p>
              <p className="text-sm text-muted-foreground">{currentContact?.name} · {formatCallDuration(callDuration)}</p>
            </div>
            <Button onClick={dismissCall}>Close</Button>
          </div>
        </div>
      )}

      {/* Active call content */}
      {isCallActive && (
        <div className="flex-1 flex overflow-hidden">
          {/* Call Structure + Transcript */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Phase progress */}
            <div className="px-6 py-3 border-b border-border">
              <div className="flex gap-1.5">
                {PHASES.map((phase, i) => (
                  <div key={phase} className="flex-1">
                    <div className={cn("h-2 rounded-full transition-all", i <= phaseIdx ? "bg-primary" : "bg-muted")} />
                    <span className={cn("text-[10px] mt-1 block text-center", i <= phaseIdx ? "text-primary font-semibold" : "text-muted-foreground")}>{phase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-2xl mx-auto">
                {transcript.map(entry => (
                  <div key={entry.id} className={cn("flex gap-3", entry.speaker === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] px-4 py-2.5 rounded-xl text-sm",
                      entry.speaker === "user" ? "bg-primary text-primary-foreground" :
                      entry.speaker === "ai" ? "bg-primary/10 text-primary border border-primary/20" :
                      "bg-muted text-foreground"
                    )}>
                      {entry.text}
                    </div>
                  </div>
                ))}
                {callStatus === "connected" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    AI is listening...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* AI Co-Pilot sidebar */}
          <div className="w-[360px] border-l border-border flex flex-col overflow-hidden bg-muted/30">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">AI Co-Pilot</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {/* Sentiment */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Sentiment</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${sentimentScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold capitalize text-muted-foreground">{sentiment}</span>
                  </div>
                </div>

                {/* Suggestions */}
                {aiSuggestions.map(s => (
                  <div key={s.id} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                        s.type === "question" ? "bg-blue-500/10 text-blue-500" :
                        s.type === "response" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      )}>{s.type}</span>
                      <span className="text-[11px] text-muted-foreground">{s.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

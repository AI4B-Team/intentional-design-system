import * as React from "react";
import { cn } from "@/lib/utils";
import { PhoneCall, Sparkles, Minimize2 } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import { CallControls, formatCallDuration } from "./CallControls";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LiveCallInline({ className }: { className?: string }) {
  const {
    isCallActive, callStatus, currentContact, callDuration, transcript,
    sentiment, sentimentScore, currentCallPhase, aiSuggestions,
    setDisplayMode,
  } = useCallState();

  if (!isCallActive) return null;

  const PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];
  const phaseIdx = PHASES.indexOf(currentCallPhase);

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-background", className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center">
            <PhoneCall className={cn("h-5 w-5 text-primary-foreground", callStatus === "ringing" && "animate-pulse")} />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-foreground">{currentContact?.name}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{callStatus === "ringing" ? "Ringing..." : formatCallDuration(callDuration)}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                {currentCallPhase}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CallControls compact />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDisplayMode("mini")}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Call Structure */}
          <div className="px-5 py-3 border-b border-border">
            <div className="flex gap-1">
              {PHASES.map((phase, i) => (
                <div key={phase} className="flex-1">
                  <div className={cn(
                    "h-1.5 rounded-full transition-all",
                    i <= phaseIdx ? "bg-primary" : "bg-muted"
                  )} />
                  <span className={cn(
                    "text-[9px] mt-1 block text-center",
                    i <= phaseIdx ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>{phase}</span>
                </div>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-5">
            <div className="space-y-3">
              {transcript.map(entry => (
                <div key={entry.id} className={cn(
                  "flex gap-2",
                  entry.speaker === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] px-3.5 py-2 rounded-lg text-[13px]",
                    entry.speaker === "user"
                      ? "bg-primary text-primary-foreground"
                      : entry.speaker === "ai"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted text-foreground"
                  )}>
                    {entry.text}
                  </div>
                </div>
              ))}
              {callStatus === "connected" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  AI is listening...
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* AI Suggestions sidebar */}
        <div className="w-[260px] border-l border-border p-4 overflow-auto bg-muted/30">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> Suggestions
          </div>
          <div className="space-y-2.5">
            {aiSuggestions.map(s => (
              <div key={s.id} className="p-2.5 bg-muted/50 rounded-lg border border-border/50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
                    s.type === "question" ? "bg-blue-500/10 text-blue-500" :
                    s.type === "response" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>{s.type}</span>
                  <span className="text-[10px] text-muted-foreground">{s.confidence}%</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Sentiment */}
          <div className="mt-4 p-2.5 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Sentiment</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${sentimentScore}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold capitalize text-muted-foreground">{sentiment}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

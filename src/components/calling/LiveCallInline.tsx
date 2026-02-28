import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PhoneCall, Sparkles, Minimize2, Phone, MessageCircle, Mail, MoreVertical, Send, FileText, X, Zap, Mic, Pause, PhoneOff, Hand, MessageSquareDashed, Bot, BarChart3, RefreshCw, Megaphone, Circle } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import { formatCallDuration } from "./CallControls";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { CallingModeKey } from "@/pages/Communications";

function CallControlButtons({ callingMode }: { callingMode: CallingModeKey }) {
  const { isMuted, isOnHold, isRecording, toggleMute, toggleHold, toggleRecording, endCall } = useCallState();

  return (
    <div className="flex items-center gap-2">
      {callingMode !== "start" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-amber-300 bg-amber-50/80 text-amber-700 hover:bg-amber-100 transition-colors"
              onClick={() => toast.info("Taking over call...")}
            >
              <Hand className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Take Over</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleMute}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
              isMuted
                ? "bg-destructive/10 text-destructive"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Mic className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{isMuted ? "Unmute" : "Mute"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleHold}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
              isOnHold
                ? "bg-warning/10 text-warning"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Pause className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{isOnHold ? "Resume" : "Hold"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleRecording}
            className={cn(
              "relative flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
              isRecording
                ? "bg-destructive/10 animate-pulse-slow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Circle className={cn("h-5 w-5", isRecording ? "text-destructive fill-destructive" : "")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{isRecording ? "Stop Recording" : "Record"}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={endCall}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">End Call</TooltipContent>
      </Tooltip>
    </div>
  );
}



// Mode-specific accent colors
const MODE_COLORS: Record<CallingModeKey, {
  iconBg: string; pulseBorder: string; headerBg: string; accent: string; badgeBg: string; badgeText: string; dot: string; label: string;
}> = {
  start: { iconBg: "bg-emerald-600", pulseBorder: "border-emerald-500/30", headerBg: "bg-emerald-500/[0.04]", accent: "text-emerald-600", badgeBg: "bg-emerald-500/10", badgeText: "text-emerald-600", dot: "bg-emerald-500", label: "LIVE: Human" },
  voice: { iconBg: "bg-blue-600", pulseBorder: "border-blue-500/30", headerBg: "bg-blue-500/[0.04]", accent: "text-blue-600", badgeBg: "bg-blue-500/10", badgeText: "text-blue-600", dot: "bg-blue-500", label: "LIVE: AI Agent" },
  listen: { iconBg: "bg-violet-600", pulseBorder: "border-violet-500/30", headerBg: "bg-violet-500/[0.04]", accent: "text-violet-600", badgeBg: "bg-violet-500/10", badgeText: "text-violet-600", dot: "bg-violet-500", label: "LIVE: Hybrid" },
};

interface LiveCallInlineProps {
  className?: string;
  callingMode?: CallingModeKey;
  onSmsClick?: () => void;
  onEmailClick?: () => void;
  onMoreClick?: () => void;
}

const AI_STATUS_CYCLE = [
  { label: "Listening…", dot: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Analyzing…", dot: "bg-blue-500", text: "text-blue-500" },
  { label: "Strategy Shift Detected…", dot: "bg-violet-500", text: "text-violet-500" },
];

export function LiveCallInline({ className, callingMode = "start", onSmsClick, onEmailClick, onMoreClick }: LiveCallInlineProps) {
  const {
    isCallActive, callStatus, currentContact, callDuration, transcript,
    sentiment, sentimentScore, currentCallPhase, aiSuggestions,
    setDisplayMode, addTranscriptEntry, incrementGoal,
  } = useCallState();

  const mc = MODE_COLORS[callingMode];

  const [smsComposerOpen, setSmsComposerOpen] = useState(false);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [aiStatusIdx, setAiStatusIdx] = useState(0);
  const [offerPanelOpen, setOfferPanelOpen] = useState(false);

  // Cycle AI status indicator
  useEffect(() => {
    if (!isCallActive || callStatus !== "connected") return;
    const interval = setInterval(() => {
      setAiStatusIdx(prev => (prev + 1) % AI_STATUS_CYCLE.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isCallActive, callStatus]);

  // Pre-fill SMS composer with AI draft
  const handleSmsOpen = () => {
    setSmsComposerOpen(true);
    setEmailComposerOpen(false);
    setComposerText(`${currentContact?.name?.split(" ")[0] || "Hi"}, as discussed, I'll send you the offer range shortly. Let me know if you have any questions.`);
    onSmsClick?.();
  };

  // Pre-fill Email composer
  const handleEmailOpen = () => {
    setEmailComposerOpen(true);
    setSmsComposerOpen(false);
    setEmailSubject(`Follow-up on ${currentContact?.address || "your property"}`);
    setEmailBody(`Hi ${currentContact?.name?.split(" ")[0] || "there"},\n\nThank you for taking the time to speak with me today. Based on our conversation, I'd like to follow up with some numbers that I think will work for both of us.\n\nI'll have a formal offer ready for you shortly.\n\nBest regards`);
    onEmailClick?.();
  };

  if (!isCallActive) return null;

  const PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];
  const phaseIdx = PHASES.indexOf(currentCallPhase);
  const aiStatus = AI_STATUS_CYCLE[aiStatusIdx];

  const handleUseSuggestion = (text: string) => {
    addTranscriptEntry({ speaker: "user", text });
    toast.success("Suggestion applied to conversation");
  };

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-background transition-colors duration-300", className)} style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header — mode-tinted */}
      <div className={cn("px-5 py-4 border-b border-border flex items-center justify-between transition-colors duration-300", mc.headerBg)}>
        <div className="flex items-center gap-3">
          <div className={cn("relative w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-300", mc.iconBg)}>
            <PhoneCall className={cn("h-5 w-5 text-white", callStatus === "ringing" && "animate-pulse")} />
            {callStatus === "connected" && (
              <span className={cn("absolute inset-0 rounded-lg border-2 animate-ping", mc.pulseBorder)} style={{ animationDuration: "2s" }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[15px] font-semibold text-foreground truncate max-w-[180px] block">{currentContact?.name}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-foreground border-border">
                  {currentContact?.name}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("font-mono font-bold transition-colors", mc.accent)}>{callStatus === "ringing" ? "Ringing..." : formatCallDuration(callDuration)}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", mc.badgeBg, mc.accent)}>
                {currentCallPhase}
              </span>
              {currentContact?.campaignName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Megaphone className="h-2.5 w-2.5" />
                  {currentContact.campaignName}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-muted-foreground">
                {sentimentScore}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CallControlButtons callingMode={callingMode} />
          <div className="w-px h-6 bg-border mx-1" />
          <div className="flex gap-2">
            <button
              onClick={() => { setSmsComposerOpen(false); setEmailComposerOpen(false); }}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
                !smsComposerOpen && !emailComposerOpen
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
              )}
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </button>
            <button onClick={handleSmsOpen} className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
              smsComposerOpen
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
            )}>
              <MessageCircle className="h-3.5 w-3.5" /> SMS
            </button>
            <button onClick={handleEmailOpen} className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
              emailComposerOpen
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
            )}>
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
            <button onClick={onMoreClick} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage Progress Bar - Auto-advancing with pulse */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex gap-1">
          {PHASES.map((phase, i) => (
            <div key={phase} className="flex-1">
              <div className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i < phaseIdx ? cn(mc.dot, "opacity-40") :
                i === phaseIdx ? cn(mc.dot, "animate-pulse") :
                "bg-muted"
              )} />
              <span className={cn(
                "text-[9px] mt-1 block text-center transition-all",
                i < phaseIdx ? "text-muted-foreground/50 line-through" :
                i === phaseIdx ? cn(mc.accent, "font-bold") :
                "text-muted-foreground"
              )}>{phase}</span>
            </div>
          ))}
        </div>
        {/* Current Strategy */}
        <div className={cn("mt-2 flex items-center gap-1.5 text-[10px] font-medium", mc.accent)}>
          <Zap className="h-3 w-3" />
          <span>Strategy: Empathy → Value Framing → Anchor at $175K</span>
        </div>
      </div>

      {/* Content - Focused Layout */}
      <div className="flex-1 min-h-0 flex flex-col" style={{ overflow: 'hidden' }}>
        {/* Live Transcript - Clean, focused */}
        <div className="flex-1 min-h-0 flex flex-col" style={{ overflow: 'hidden' }}>
          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            <div className="space-y-3">
              {transcript.map(entry => (
                <div key={entry.id} className={cn(
                  "flex gap-2",
                  entry.speaker === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed",
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
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn("relative flex h-2 w-2")}>
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", aiStatus.dot)} />
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", aiStatus.dot)} />
                  </span>
                  <span className={cn("font-medium transition-colors duration-300", aiStatus.text)}>{aiStatus.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* SMS Slide-Up Composer */}
          {smsComposerOpen && (
            <div className="border-t border-border bg-muted/30 p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <MessageCircle className="h-3 w-3 text-blue-500" /> SMS Draft
                </span>
                <button onClick={() => setSmsComposerOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => { toast.success("SMS sent"); setSmsComposerOpen(false); }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                  Send
                </button>
                <button onClick={() => {
                  toast.info("Rewriting...");
                  setTimeout(() => {
                    setComposerText(composerText + " — I'd love to lock this down for you today.");
                    toast.success("Enhanced");
                  }, 600);
                }} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Rewrite
                </button>
                <button onClick={() => toast.info("Scheduling...")} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Schedule
                </button>
                <button onClick={() => {
                  setComposerText(composerText + "\n\nOffer range: $165k–$180k based on comparable sales.");
                  toast.info("Offer range added");
                }} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Add Offer
                </button>
              </div>
            </div>
          )}

          {/* Email Slide-Up Composer */}
          {emailComposerOpen && (
            <div className="border-t border-border bg-muted/30 p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-amber-500" /> Email Draft
                </span>
                <button onClick={() => setEmailComposerOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 mb-2"
              />
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => { toast.success("Email sent"); setEmailComposerOpen(false); }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                  Send
                </button>
                <button onClick={() => toast.info("Adjusting tone...")} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Edit Tone
                </button>
                <button onClick={() => {
                  setEmailBody(emailBody + "\n\nOffer Summary:\n• Cash offer: $165k–$180k\n• Close in 14–21 days\n• No repairs needed");
                  toast.info("Offer summary added");
                }} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Add Offer
                </button>
                <button onClick={() => toast.info("Attaching comps PDF...")} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Attach Comps
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAY THIS NEXT — Horizontal suggestion cards anchored at bottom */}
        {callStatus === "connected" && (
          <div className="border-t border-border bg-muted/20 px-5 py-3 flex-shrink-0 space-y-3">
            {/* Say This Next + Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquareDashed className="h-3.5 w-3.5" /> Say This Next
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.info("Opening strategy panel...")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Strategy
                </button>
                <button
                  onClick={() => {
                    setOfferPanelOpen(!offerPanelOpen);
                    if (!offerPanelOpen) {
                      toast.info("Pulling ARV, rehab estimate & margin rules...");
                      incrementGoal("offersSent");
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                    offerPanelOpen
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <BarChart3 className="h-3 w-3" />
                  Insert Offer
                </button>
              </div>
            </div>

            {/* Offer Insert Panel */}
            {offerPanelOpen && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-amber-500" /> Quick Offer Builder
                  </span>
                  <button onClick={() => setOfferPanelOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X className="h-3 w-3" /></button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-background rounded-md border border-border">
                    <div className="text-[10px] text-muted-foreground">ARV</div>
                    <div className="text-sm font-bold text-foreground">$285k</div>
                  </div>
                  <div className="p-2 bg-background rounded-md border border-border">
                    <div className="text-[10px] text-muted-foreground">Repairs</div>
                    <div className="text-sm font-bold text-foreground">$45k</div>
                  </div>
                  <div className="p-2 bg-background rounded-md border border-border">
                    <div className="text-[10px] text-muted-foreground">MAO (70%)</div>
                    <div className="text-sm font-bold text-primary">$154k</div>
                  </div>
                  <div className="p-2 bg-background rounded-md border border-border">
                    <div className="text-[10px] text-muted-foreground">Suggested</div>
                    <div className="text-sm font-bold text-emerald-600">$165k–$180k</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    addTranscriptEntry({ speaker: "user", text: "Based on my analysis, I can offer between $165,000 and $180,000 cash, close in 14 days, no repairs needed on your end." });
                    toast.success("Offer script inserted into conversation");
                    setOfferPanelOpen(false);
                  }} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                    Use Offer Script
                  </button>
                  <button onClick={() => {
                    toast.success("Offer logged to deal pipeline");
                    setOfferPanelOpen(false);
                  }} className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Log Offer
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              {(aiSuggestions.length > 0 ? aiSuggestions.slice(0, 3) : [
                { id: "fallback-1", type: "question" as const, text: `What's your timeline for making a decision on ${currentContact?.address?.split(",")[0] || "the property"}?`, confidence: 85 },
                { id: "fallback-2", type: "response" as const, text: "I completely understand your concern. Many sellers I work with felt the same way — let me share what made the difference for them.", confidence: 78 },
                { id: "fallback-3", type: "coach" as const, text: "Based on everything we've discussed, would it make sense to schedule a quick walkthrough this week?", confidence: 72 },
              ]).map(s => (
                <div key={s.id} className="flex-1 flex flex-col bg-background rounded-lg border border-border/80 hover:border-primary/30 transition-all overflow-hidden">
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide",
                        s.type === "question" ? "bg-blue-500/10 text-blue-600" :
                        s.type === "response" ? "bg-emerald-500/10 text-emerald-600" :
                        "bg-muted text-muted-foreground"
                      )}>{s.type === "coach" ? "close test" : s.type}</span>
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground">{s.confidence}%</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed flex-1">{s.text}</p>
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => handleUseSuggestion(s.text)}
                      className={cn(
                        "w-full py-2 rounded-lg text-xs font-semibold transition-all",
                        s.type === "coach"
                          ? "bg-muted text-foreground hover:bg-muted/80"
                          : s.type === "response"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      )}
                    >
                      {s.type === "coach" ? "Apply" : "Use"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
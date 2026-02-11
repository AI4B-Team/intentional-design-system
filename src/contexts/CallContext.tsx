import * as React from "react";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================
export interface CallContact {
  id: string;
  name: string;
  phone: string;
  address?: string;
  tag?: string;
  avatar?: string;
}

export type CallMode = "quick" | "dialer" | "inline";
export type DisplayMode = "mini" | "inline" | "fullscreen";
export type CallStatus = "idle" | "ringing" | "connected" | "on-hold" | "ended";

export interface TranscriptEntry {
  id: string;
  speaker: "user" | "contact" | "ai";
  text: string;
  timestamp: number;
}

export interface AISuggestion {
  id: string;
  type: "question" | "response" | "coach";
  text: string;
  confidence: number;
}

export interface CallScript {
  id: string;
  name: string;
  type: string;
  phases: string[];
}

export interface CallState {
  // Current call
  isCallActive: boolean;
  callMode: CallMode | null;
  currentContact: CallContact | null;
  callDuration: number;
  callStatus: CallStatus;
  isMuted: boolean;
  isOnHold: boolean;
  isRecording: boolean;

  // Display mode
  displayMode: DisplayMode;

  // Power dialer session
  isDialerSessionActive: boolean;
  dialerQueue: CallContact[];
  dialerQueueIndex: number;
  autoAdvanceCountdown: number | null;
  selectedScript: CallScript | null;

  // AI Co-Pilot
  transcript: TranscriptEntry[];
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  currentCallPhase: string;
  aiSuggestions: AISuggestion[];

  // Actions
  startCall: (contact: CallContact, mode: CallMode) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  toggleRecording: () => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setDialerQueue: (queue: CallContact[]) => void;
  startDialerSession: () => void;
  advanceDialerQueue: () => void;
  pauseDialerSession: () => void;
  cancelAutoAdvance: () => void;
  setSelectedScript: (script: CallScript | null) => void;
  addTranscriptEntry: (entry: Omit<TranscriptEntry, "id" | "timestamp">) => void;
  dismissCall: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================
const CallContext = createContext<CallState | null>(null);

export function useCallState(): CallState {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallState must be used inside CallProvider");
  return ctx;
}

// ============================================================================
// MOCK AI SUGGESTIONS
// ============================================================================
const MOCK_SUGGESTIONS: AISuggestion[] = [
  { id: "s1", type: "question", text: "What's your timeline for selling?", confidence: 92 },
  { id: "s2", type: "response", text: "I understand your concern about pricing. Let me walk you through our comparable sales analysis.", confidence: 87 },
  { id: "s3", type: "coach", text: "The seller seems hesitant — try mirroring their last statement to build rapport.", confidence: 78 },
];

const CALL_PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];

// ============================================================================
// PROVIDER
// ============================================================================
export function CallProvider({ children }: { children: React.ReactNode }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callMode, setCallMode] = useState<CallMode | null>(null);
  const [currentContact, setCurrentContact] = useState<CallContact | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("mini");

  const [isDialerSessionActive, setIsDialerSessionActive] = useState(false);
  const [dialerQueue, setDialerQueue] = useState<CallContact[]>([]);
  const [dialerQueueIndex, setDialerQueueIndex] = useState(0);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [selectedScript, setSelectedScript] = useState<CallScript | null>(null);

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative">("neutral");
  const [sentimentScore, setSentimentScore] = useState(50);
  const [currentCallPhase, setCurrentCallPhase] = useState(CALL_PHASES[0]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Call duration timer
  useEffect(() => {
    if (isCallActive && callStatus === "connected") {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive, callStatus]);

  // Auto-advance countdown
  useEffect(() => {
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      autoAdvanceRef.current = setTimeout(() => {
        setAutoAdvanceCountdown(c => (c !== null ? c - 1 : null));
      }, 1000);
    } else if (autoAdvanceCountdown === 0) {
      // Auto-advance to next call
      advanceDialerQueue();
    }
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [autoAdvanceCountdown]);

  // Simulate call phases advancing
  useEffect(() => {
    if (isCallActive && callStatus === "connected") {
      let phaseIdx = 0;
      phaseTimerRef.current = setInterval(() => {
        phaseIdx = Math.min(phaseIdx + 1, CALL_PHASES.length - 1);
        setCurrentCallPhase(CALL_PHASES[phaseIdx]);
      }, 15000); // advance phase every 15s
    }
    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, [isCallActive, callStatus]);

  const startCall = useCallback((contact: CallContact, mode: CallMode) => {
    setCurrentContact(contact);
    setCallMode(mode);
    setCallStatus("ringing");
    setIsCallActive(true);
    setCallDuration(0);
    setIsMuted(false);
    setIsOnHold(false);
    setIsRecording(false);
    setTranscript([]);
    setCurrentCallPhase(CALL_PHASES[0]);
    setAiSuggestions(MOCK_SUGGESTIONS);
    setSentiment("neutral");
    setSentimentScore(50);
    setAutoAdvanceCountdown(null);

    if (mode === "quick") setDisplayMode("mini");
    else if (mode === "inline") setDisplayMode("inline");
    else setDisplayMode("fullscreen");

    toast.info(`Calling ${contact.name}...`);

    // Simulate connection after 2s
    setTimeout(() => {
      setCallStatus("connected");
      toast.success(`Connected to ${contact.name}`);
      // Add initial transcript
      setTranscript([{
        id: `t_${Date.now()}`,
        speaker: "user",
        text: "Hello, is this " + contact.name + "?",
        timestamp: Date.now(),
      }]);
    }, 2000);
  }, []);

  const endCall = useCallback(() => {
    const contactName = currentContact?.name || "Unknown";
    setCallStatus("ended");
    setIsCallActive(false);
    toast.info(`Call with ${contactName} ended — ${formatDuration(callDuration)}`);

    // If in dialer session, start auto-advance
    if (isDialerSessionActive && dialerQueueIndex < dialerQueue.length - 1) {
      setAutoAdvanceCountdown(5);
    }
  }, [currentContact, callDuration, isDialerSessionActive, dialerQueueIndex, dialerQueue.length]);

  const dismissCall = useCallback(() => {
    setCallStatus("idle");
    setCurrentContact(null);
    setCallMode(null);
    setCallDuration(0);
    setTranscript([]);
    setAiSuggestions([]);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(m => !m);
    toast.info(isMuted ? "Unmuted" : "Muted");
  }, [isMuted]);

  const toggleHold = useCallback(() => {
    setIsOnHold(h => !h);
    toast.info(isOnHold ? "Resumed" : "On Hold");
  }, [isOnHold]);

  const toggleRecording = useCallback(() => {
    setIsRecording(r => !r);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  }, [isRecording]);

  const startDialerSession = useCallback(() => {
    if (dialerQueue.length === 0) {
      toast.error("No contacts in the queue");
      return;
    }
    setIsDialerSessionActive(true);
    setDialerQueueIndex(0);
    const first = dialerQueue[0];
    startCall(first, "dialer");
  }, [dialerQueue, startCall]);

  const advanceDialerQueue = useCallback(() => {
    setAutoAdvanceCountdown(null);
    const nextIdx = dialerQueueIndex + 1;
    if (nextIdx >= dialerQueue.length) {
      setIsDialerSessionActive(false);
      toast.success("Dialer session complete — all contacts called");
      dismissCall();
      return;
    }
    setDialerQueueIndex(nextIdx);
    startCall(dialerQueue[nextIdx], "dialer");
  }, [dialerQueueIndex, dialerQueue, startCall, dismissCall]);

  const pauseDialerSession = useCallback(() => {
    setAutoAdvanceCountdown(null);
    setIsDialerSessionActive(false);
    toast.info("Dialer session paused");
  }, []);

  const cancelAutoAdvance = useCallback(() => {
    setAutoAdvanceCountdown(null);
  }, []);

  const addTranscriptEntry = useCallback((entry: Omit<TranscriptEntry, "id" | "timestamp">) => {
    setTranscript(prev => [...prev, { ...entry, id: `t_${Date.now()}`, timestamp: Date.now() }]);
  }, []);

  const value: CallState = {
    isCallActive,
    callMode,
    currentContact,
    callDuration,
    callStatus,
    isMuted,
    isOnHold,
    isRecording,
    displayMode,
    isDialerSessionActive,
    dialerQueue,
    dialerQueueIndex,
    autoAdvanceCountdown,
    selectedScript,
    transcript,
    sentiment,
    sentimentScore,
    currentCallPhase,
    aiSuggestions,
    startCall,
    endCall,
    toggleMute,
    toggleHold,
    toggleRecording,
    setDisplayMode,
    setDialerQueue,
    startDialerSession,
    advanceDialerQueue,
    pauseDialerSession,
    cancelAutoAdvance,
    setSelectedScript,
    addTranscriptEntry,
    dismissCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

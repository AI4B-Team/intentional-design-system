import * as React from "react";
import { cn } from "@/lib/utils";
import { Shield, Search, Minus, Flame, AlertTriangle, TrendingUp, TrendingDown, Pause } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";

export type EmotionalState = "defensive" | "curious" | "neutral" | "engaged" | "urgent";
export type MomentumState = "increasing" | "stalled" | "resistance";

const EMOTION_CONFIG: Record<EmotionalState, {
  icon: React.ElementType; label: string; color: string; bg: string; border: string; strategy: string;
}> = {
  defensive: { icon: Shield, label: "Defensive", color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/20", strategy: "Switch to empathy script — don't push forward" },
  curious: { icon: Search, label: "Curious", color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20", strategy: "Feed curiosity with value props — answer questions directly" },
  neutral: { icon: Minus, label: "Neutral", color: "text-muted-foreground", bg: "bg-muted", border: "border-border", strategy: "Build rapport — find common ground before pitching" },
  engaged: { icon: Flame, label: "Engaged", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", strategy: "Momentum is yours — advance toward qualification" },
  urgent: { icon: AlertTriangle, label: "Urgent", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", strategy: "Seller has urgency — present offer now, compress timeline" },
};

const MOMENTUM_CONFIG: Record<MomentumState, {
  icon: React.ElementType; label: string; color: string; bg: string;
}> = {
  increasing: { icon: TrendingUp, label: "Momentum Increasing", color: "text-emerald-600", bg: "bg-emerald-500" },
  stalled: { icon: Pause, label: "Momentum Stalled", color: "text-amber-600", bg: "bg-amber-500" },
  resistance: { icon: TrendingDown, label: "Resistance Detected", color: "text-red-600", bg: "bg-red-500" },
};

function deriveEmotionalState(sentimentScore: number, sentiment: string, phase: string): EmotionalState {
  if (sentimentScore < 30) return "defensive";
  if (sentimentScore >= 75) return phase === "Close" || phase === "Qualification" ? "urgent" : "engaged";
  if (sentimentScore >= 55) return "curious";
  return "neutral";
}

function deriveMomentum(sentimentScore: number, callDuration: number, phase: string): MomentumState {
  if (sentimentScore >= 60 && callDuration > 30) return "increasing";
  if (sentimentScore < 35) return "resistance";
  return "stalled";
}

interface EmotionalStateLayerProps {
  className?: string;
  compact?: boolean;
}

export function EmotionalStateLayer({ className, compact = false }: EmotionalStateLayerProps) {
  const { sentimentScore, sentiment, currentCallPhase, callDuration, callStatus } = useCallState();

  if (callStatus !== "connected") return null;

  const emotionalState = deriveEmotionalState(sentimentScore, sentiment, currentCallPhase);
  const momentum = deriveMomentum(sentimentScore, callDuration, currentCallPhase);
  const ec = EMOTION_CONFIG[emotionalState];
  const mc = MOMENTUM_CONFIG[momentum];
  const EmotionIcon = ec.icon;
  const MomentumIcon = mc.icon;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", ec.bg, ec.color, ec.border)}>
          <EmotionIcon className="h-2.5 w-2.5" /> {ec.label}
        </span>
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold", mc.color)}>
          <MomentumIcon className="h-3 w-3" /> {mc.label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Emotional State */}
      <div className={cn("p-3 rounded-lg border", ec.bg, ec.border)}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <EmotionIcon className={cn("h-3.5 w-3.5", ec.color)} />
            <span className={cn("text-[11px] font-bold", ec.color)}>{ec.label}</span>
          </div>
          <div className="flex gap-0.5">
            {(["defensive", "curious", "neutral", "engaged", "urgent"] as EmotionalState[]).map(s => (
              <div
                key={s}
                className={cn(
                  "h-1.5 w-4 rounded-full transition-all",
                  s === emotionalState ? EMOTION_CONFIG[s].bg.replace("/10", "") : "bg-muted"
                )}
                style={s === emotionalState ? { backgroundColor: `hsl(var(--${s === "defensive" ? "destructive" : s === "engaged" ? "success" : "primary"}))` } : undefined}
              />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{ec.strategy}</p>
      </div>

      {/* Momentum Meter */}
      <div className="flex items-center gap-2 px-1">
        <MomentumIcon className={cn("h-3.5 w-3.5", mc.color)} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={cn("text-[10px] font-bold", mc.color)}>{mc.label}</span>
            <span className="text-[10px] font-mono font-bold text-muted-foreground">{sentimentScore}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", mc.bg)}
              style={{ width: `${sentimentScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";
import { User, Bot, Handshake, ArrowRight, Info } from "lucide-react";
import type { CallingModeKey } from "@/pages/Communications";

const MODE_INFO: Record<CallingModeKey, {
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  description: string;
  capabilities: string[];
  color: string;
  bg: string;
  border: string;
}> = {
  start: {
    icon: User,
    label: "Human Mode",
    shortLabel: "Human",
    description: "You control the conversation. AI listens and suggests.",
    capabilities: ["AI listens", "AI suggests scripts", "No auto-speaking", "No auto-sending"],
    color: "text-emerald-600",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
  },
  listen: {
    icon: Handshake,
    label: "Hybrid Mode",
    shortLabel: "Hybrid",
    description: "AI handles opening + objections. You control the close.",
    capabilities: ["AI handles opening", "AI handles objections", "Human interrupts anytime", "Human controls close", "AI drafts follow-ups"],
    color: "text-violet-600",
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
  },
  voice: {
    icon: Bot,
    label: "AI Agent Mode",
    shortLabel: "AI Agent",
    description: "AI runs the entire call. You can take over anytime.",
    capabilities: ["AI runs full call", "Human can take over", "AI logs & summarizes", "AI moves pipeline", "AI sends follow-ups automatically"],
    color: "text-blue-600",
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
  },
};

interface ModeTransitionBannerProps {
  fromMode: CallingModeKey;
  toMode: CallingModeKey;
  isVisible: boolean;
  onDismiss: () => void;
  className?: string;
}

export function ModeTransitionBanner({ fromMode, toMode, isVisible, onDismiss, className }: ModeTransitionBannerProps) {
  const to = MODE_INFO[toMode];
  const ToIcon = to.icon;

  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible || fromMode === toMode) return null;

  return (
    <div className={cn(
      "mx-5 p-3 rounded-lg border animate-fade-in",
      to.bg, to.border, className
    )}>
      <div className="flex items-center gap-2">
        <ToIcon className={cn("h-4 w-4", to.color)} />
        <span className={cn("text-xs font-bold", to.color)}>
          Switching to {to.label}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{to.description}</span>
      </div>
    </div>
  );
}

interface ModeBehaviorCardProps {
  mode: CallingModeKey;
  isActive: boolean;
  className?: string;
}

export function ModeBehaviorCard({ mode, isActive, className }: ModeBehaviorCardProps) {
  const info = MODE_INFO[mode];
  const Icon = info.icon;

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      isActive ? cn(info.bg, info.border, "ring-1 ring-offset-1", info.border.replace("border-", "ring-")) : "bg-background border-border opacity-60",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", isActive ? info.color : "text-muted-foreground")} />
        <span className={cn("text-xs font-bold", isActive ? info.color : "text-muted-foreground")}>{info.label}</span>
        {isActive && (
          <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", info.bg, info.color)}>Active</span>
        )}
      </div>
      <div className="space-y-0.5">
        {info.capabilities.map((cap, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={cn("h-1 w-1 rounded-full", isActive ? info.bg.replace("/5", "") : "bg-muted")} />
            {cap}
          </div>
        ))}
      </div>
    </div>
  );
}

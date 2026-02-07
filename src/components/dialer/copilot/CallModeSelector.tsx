import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Headphones, Mic, Bot } from "lucide-react";
import type { CallMode } from "./types";

interface CallModeSelectorProps {
  mode: CallMode;
  onModeChange: (mode: CallMode) => void;
  disabled?: boolean;
}

export function CallModeSelector({ mode, onModeChange, disabled }: CallModeSelectorProps) {
  const modes = [
    {
      id: "listen_mode" as CallMode,
      label: "Listen Mode",
      description: "You talk, AI assists",
      icon: Headphones,
      badge: "Recommended",
    },
    {
      id: "voice_agent" as CallMode,
      label: "Voice Agent",
      description: "AI handles the call",
      icon: Bot,
      badge: "Beta",
    },
  ];

  return (
    <div className="bg-white border border-border-subtle rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mic className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Call Mode</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => {
          const isSelected = mode === m.id;
          const isListenMode = m.id === "listen_mode";
          const isVoiceAgent = m.id === "voice_agent";

          return (
            <button
              key={m.id}
              onClick={() => !disabled && onModeChange(m.id)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                isSelected && isListenMode && "border-dialer-listen-mode bg-dialer-listen-mode/10",
                isSelected && isVoiceAgent && "border-dialer-voice-agent bg-dialer-voice-agent/10",
                !isSelected && isListenMode &&
                  "border-dialer-listen-mode/30 bg-dialer-listen-mode/5 hover:border-dialer-listen-mode/50",
                !isSelected && isVoiceAgent &&
                  "border-dialer-voice-agent/30 bg-dialer-voice-agent/5 hover:border-dialer-voice-agent/50",
                !isSelected && !isListenMode && !isVoiceAgent && "border-border-subtle bg-muted/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {m.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "absolute -top-2 -right-2 text-[9px] px-1.5 py-0",
                    isListenMode && "bg-dialer-listen-mode/20 text-dialer-listen-mode",
                    isVoiceAgent && "bg-dialer-voice-agent/20 text-dialer-voice-agent"
                  )}
                >
                  {m.badge}
                </Badge>
              )}

              <m.icon
                className={cn(
                  "h-6 w-6 mb-2",
                  isSelected && isListenMode && "text-dialer-listen-mode",
                  isSelected && isVoiceAgent && "text-dialer-voice-agent",
                  !isSelected && "text-muted-foreground"
                )}
              />

              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected && isListenMode && "text-dialer-listen-mode",
                  isSelected && isVoiceAgent && "text-dialer-voice-agent",
                  !isSelected && "text-foreground"
                )}
              >
                {m.label}
              </span>

              <span className="text-[10px] text-muted-foreground text-center mt-0.5">{m.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

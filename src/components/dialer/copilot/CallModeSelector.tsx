import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Headphones, Mic, Bot, User } from 'lucide-react';
import type { CallMode } from './types';

interface CallModeSelectorProps {
  mode: CallMode;
  onModeChange: (mode: CallMode) => void;
  disabled?: boolean;
}

export function CallModeSelector({ mode, onModeChange, disabled }: CallModeSelectorProps) {
  const modes = [
    {
      id: 'listen_mode' as CallMode,
      label: 'Listen Mode',
      description: 'You talk, AI assists',
      icon: Headphones,
      badge: 'Recommended',
    },
    {
      id: 'voice_agent' as CallMode,
      label: 'Voice Agent',
      description: 'AI handles the call',
      icon: Bot,
      badge: 'Beta',
    },
  ];

  return (
    <div className="bg-white border border-border-subtle rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mic className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Call Mode</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => !disabled && onModeChange(m.id)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center p-3 rounded-lg border-2 transition-all",
              "hover:border-primary/50",
              mode === m.id 
                ? "border-primary bg-primary/5" 
                : "border-border-subtle bg-muted/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {m.badge && (
              <Badge 
                variant={m.id === 'voice_agent' ? 'secondary' : 'default'}
                className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0"
              >
                {m.badge}
              </Badge>
            )}
            <m.icon className={cn(
              "h-6 w-6 mb-2",
              mode === m.id ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              mode === m.id ? "text-primary" : "text-foreground"
            )}>
              {m.label}
            </span>
            <span className="text-[10px] text-muted-foreground text-center mt-0.5">
              {m.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

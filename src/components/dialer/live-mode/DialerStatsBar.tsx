import * as React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type DialerMode = 'start' | 'voice' | 'listen';

interface StatDef {
  label: string;
  value: string;
  tooltip: string;
}

function getStatsForMode(mode: DialerMode, calledCount: number): StatDef[] {
  switch (mode) {
    case 'voice':
      return [
        { label: 'Calls Made', value: calledCount.toString(), tooltip: 'AI outbound calls initiated' },
        { label: 'Contacts Reached', value: Math.max(0, calledCount - 1).toString(), tooltip: 'Live connects where a human answered' },
        { label: 'Appointments Set', value: '1', tooltip: 'Meetings booked by AI or transferred to calendar flow' },
        { label: 'Talk Time', value: '2:48', tooltip: 'Connected time while AI agent is speaking/listening' },
        { label: 'Calls/Hour', value: calledCount > 0 ? '18.5' : '0', tooltip: 'AI calls initiated per hour' },
      ];
    case 'listen':
      return [
        { label: 'Captured Calls', value: calledCount.toString(), tooltip: 'External calls imported and recorded' },
        { label: 'Captured Calls', value: calledCount.toString(), tooltip: 'Total captured call count' },
        { label: 'Appointments Set', value: '2', tooltip: 'Meetings detected or created from captured calls' },
        { label: 'Talk Time', value: '12:35', tooltip: 'Total recorded minutes captured' },
        { label: 'Calls/Hour', value: calledCount > 0 ? '4.2' : '0', tooltip: 'Captured calls per hour' },
      ];
    default: // start (human)
      return [
        { label: 'Calls Made', value: calledCount.toString(), tooltip: 'Outbound calls attempted by user' },
        { label: 'Contacts Reached', value: Math.max(0, calledCount - 1).toString(), tooltip: 'Answered calls / live conversations' },
        { label: 'Appointments Set', value: '2', tooltip: 'Meetings scheduled during calls' },
        { label: 'Talk Time', value: '18:42', tooltip: 'Connected call duration' },
        { label: 'Calls/Hour', value: calledCount > 0 ? '14.2' : '0', tooltip: 'Calls made per hour' },
      ];
  }
}

const MODE_LABELS: Record<DialerMode, string> = {
  start: 'Start Call',
  voice: 'Voice Agent',
  listen: 'Listen Mode',
};

interface DialerStatsBarProps {
  mode: DialerMode;
  calledCount: number;
}

export function DialerStatsBar({ mode, calledCount }: DialerStatsBarProps) {
  const stats = getStatsForMode(mode, calledCount);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Mode:</span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-primary">{MODE_LABELS[mode]}</span>
      </div>
      <div className="flex gap-3">
        {stats.map((stat, idx) => (
          <div key={`${stat.label}-${idx}`} className="flex-1 px-4 py-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{stat.label}</span>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-background text-foreground border border-border text-[11px] max-w-[200px]">
                  {stat.tooltip}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold text-foreground tabular-nums">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

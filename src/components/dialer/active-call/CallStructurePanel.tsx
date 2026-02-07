import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, Target, MessageSquare, RefreshCw } from 'lucide-react';

export interface CallPhase {
  id: string;
  name: string;
  duration?: string;
  status: 'completed' | 'current' | 'pending';
}

interface CallStructurePanelProps {
  phases: CallPhase[];
  currentPhaseId?: string;
  onNextPhase?: () => void;
  onSwitchTemplate?: () => void;
  callTemplate?: {
    name: string;
    category: string;
    description: string;
  };
}

export function CallStructurePanel({
  phases,
  currentPhaseId,
  onNextPhase,
  onSwitchTemplate,
  callTemplate,
}: CallStructurePanelProps) {
  const getPhaseIcon = (status: CallPhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'current':
        return (
          <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        );
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Call Template */}
      {callTemplate && (
        <div className="bg-white border border-border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Call Template</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onSwitchTemplate} className="h-7 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Switch
            </Button>
          </div>
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{callTemplate.name}</h4>
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                  {callTemplate.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{callTemplate.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Call Structure */}
      <div className="bg-white border border-border-subtle rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Call Structure</span>
          </div>
          {onNextPhase && (
            <Button variant="default" size="sm" onClick={onNextPhase} className="h-7 text-xs gap-1">
              <ArrowRight className="h-3 w-3" />
              Next Phase
            </Button>
          )}
        </div>

        <div className="space-y-1">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={cn(
                'flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors',
                phase.status === 'current' && 'bg-primary/5',
                phase.status === 'completed' && 'opacity-75'
              )}
            >
              <div className="flex items-center gap-3">
                {getPhaseIcon(phase.status)}
                <span
                  className={cn(
                    'text-sm',
                    phase.status === 'current' && 'font-medium text-primary',
                    phase.status === 'completed' && 'text-muted-foreground',
                    phase.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {phase.name}
                </span>
              </div>
              {phase.duration && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {phase.duration}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

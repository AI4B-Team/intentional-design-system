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
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'current':
        return (
          <div className="h-5 w-5 rounded-full border-2 border-success bg-success/20 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-success" />
          </div>
        );
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/50" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Call Template - Yellow themed */}
      {callTemplate && (
        <div className="bg-warning/5 border border-warning/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Call Template</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onSwitchTemplate} className="h-7 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Switch
            </Button>
          </div>
          <div className="flex items-start gap-3 bg-white border border-border-subtle rounded-lg p-3">
            <div className="h-10 w-10 rounded-lg bg-success flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-success-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{callTemplate.name}</h4>
                <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">
                  {callTemplate.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{callTemplate.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Call Structure - Updated design matching reference */}
      <div className="bg-white border border-border-subtle rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Call Structure</span>
          </div>
          {onNextPhase && (
            <Button variant="ghost" size="sm" onClick={onNextPhase} className="h-7 text-xs gap-1 text-primary hover:text-primary">
              <ArrowRight className="h-3 w-3" />
              Next Phase
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={cn(
                'flex items-center justify-between py-3 px-4 rounded-xl transition-colors border',
                phase.status === 'current' && 'bg-success/10 border-success/30',
                phase.status === 'completed' && 'bg-success/5 border-success/20',
                phase.status === 'pending' && 'bg-muted/50 border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                {getPhaseIcon(phase.status)}
                <span
                  className={cn(
                    'text-sm font-medium',
                    phase.status === 'current' && 'text-success',
                    phase.status === 'completed' && 'text-success',
                    phase.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {phase.name}
                </span>
              </div>
              {phase.duration && (
                <span className={cn(
                  "text-sm font-mono tabular-nums",
                  phase.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                )}>
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

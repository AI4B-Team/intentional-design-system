import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export function CopilotPracticeTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Practice with AI role-play</p>
      <div className="grid gap-3">
        {[
          { scenario: 'Cold Call - Absentee Owner', difficulty: 'Easy' },
          { scenario: 'Handling "Too Low" Objection', difficulty: 'Medium' },
          { scenario: 'Negotiating with Agent', difficulty: 'Hard' },
          { scenario: 'Subject-To Pitch', difficulty: 'Medium' },
        ].map((practice, i) => (
          <button
            key={i}
            className="w-full text-left p-3 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{practice.scenario}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  practice.difficulty === 'Easy' && "border-success/50 text-success",
                  practice.difficulty === 'Medium' && "border-warning/50 text-warning",
                  practice.difficulty === 'Hard' && "border-destructive/50 text-destructive"
                )}
              >
                {practice.difficulty}
              </Badge>
            </div>
          </button>
        ))}
      </div>
      <Button variant="default" className="w-full">
        <GraduationCap className="h-4 w-4 mr-2" />
        Start Practice Session
      </Button>
    </div>
  );
}

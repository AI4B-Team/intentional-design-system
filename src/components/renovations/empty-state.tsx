import { Button } from "@/components/ui/button";
import { Home, Sparkles, Paintbrush, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          {/* Before */}
          <div className="relative">
            <div className="w-32 h-24 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <Home className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
              Before
            </span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground/30 via-primary to-muted-foreground/30" />
          </div>

          {/* After */}
          <div className="relative">
            <div className="w-32 h-24 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 flex items-center justify-center">
              <Paintbrush className="h-10 w-10 text-primary" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
              After
            </span>
          </div>
        </div>
      </div>

      {/* Text */}
      <h3 className="text-2xl font-semibold mb-2 mt-4">
        Create your first renovation project
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Stage empty rooms, swap materials, visualize exterior changes — all
        powered by AI
      </p>

      {/* CTA */}
      <Button onClick={onCreateProject} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Create Project
      </Button>
    </div>
  );
}

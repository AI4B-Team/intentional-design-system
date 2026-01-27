import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  calculateMotivationScore,
  getCategories,
  getSignalsByCategory,
  CATEGORY_LABELS,
  CATEGORY_MAX_SCORES,
  type SignalCategory,
} from "@/lib/motivationiq";
import { MotivationIQBadge } from "./motivation-iq-badge";
import { ChevronDown, ChevronRight, Zap, TrendingUp, Sparkles } from "lucide-react";

interface MotivationIQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSignals: string[];
  onSave: (signals: string[], score: number) => void;
  isSaving?: boolean;
}

const categoryIcons: Record<SignalCategory, React.ElementType> = {
  financial_distress: TrendingUp,
  life_transitions: Sparkles,
  opportunity_indicators: Zap,
  property_condition: TrendingUp,
};

export function MotivationIQModal({
  open,
  onOpenChange,
  currentSignals,
  onSave,
  isSaving,
}: MotivationIQModalProps) {
  const [selectedSignals, setSelectedSignals] = React.useState<Set<string>>(
    new Set(currentSignals)
  );
  const [expandedCategories, setExpandedCategories] = React.useState<Set<SignalCategory>>(
    new Set(getCategories())
  );

  // Reset when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedSignals(new Set(currentSignals));
    }
  }, [open, currentSignals]);

  // Calculate score in real-time
  const scoreResult = React.useMemo(() => {
    return calculateMotivationScore(Array.from(selectedSignals));
  }, [selectedSignals]);

  const toggleSignal = (signalId: string) => {
    setSelectedSignals((prev) => {
      const next = new Set(prev);
      if (next.has(signalId)) {
        next.delete(signalId);
      } else {
        next.add(signalId);
      }
      return next;
    });
  };

  const toggleCategory = (category: SignalCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedSignals), scoreResult.score);
  };

  const categories = getCategories();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>MotivationIQ Scoring</span>
            <MotivationIQBadge score={scoreResult.score} size="md" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {/* Score Summary */}
          <div className="bg-background-secondary rounded-medium p-4 mb-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              {categories.map((category) => {
                const max = CATEGORY_MAX_SCORES[category];
                const current = scoreResult.categoryScores[category];
                const percentage = Math.min((current / max) * 100, 100);

                return (
                  <div key={category} className="text-center">
                    <div className="text-tiny uppercase tracking-wide text-muted-foreground mb-1">
                      {CATEGORY_LABELS[category].split(" ")[0]}
                    </div>
                    <div className="text-h3 font-semibold text-foreground tabular-nums">
                      {current}
                      <span className="text-small text-muted-foreground">/{max}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bonuses */}
            {scoreResult.bonuses.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="text-tiny uppercase tracking-wide text-muted-foreground mb-2">
                  Cross-Correlation Bonuses
                </div>
                <div className="flex flex-wrap gap-2">
                  {scoreResult.bonuses.map((bonus, i) => (
                    <Badge key={i} variant="success" size="sm">
                      +{bonus.points} {bonus.reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Signal Categories */}
          <div className="space-y-3">
            {categories.map((category) => {
              const signals = getSignalsByCategory(category);
              const isExpanded = expandedCategories.has(category);
              const selectedCount = signals.filter((s) =>
                selectedSignals.has(s.id)
              ).length;
              const Icon = categoryIcons[category];

              return (
                <Collapsible key={category} open={isExpanded}>
                  <CollapsibleTrigger
                    className="flex items-center justify-between w-full p-3 bg-white border border-border-subtle rounded-medium hover:bg-background-secondary transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Icon className="h-4 w-4 text-accent" />
                      <span className="font-medium text-foreground">
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={selectedCount > 0 ? "info" : "secondary"}
                        size="sm"
                      >
                        {selectedCount} selected
                      </Badge>
                      <span className="text-small text-muted-foreground">
                        max {CATEGORY_MAX_SCORES[category]} pts
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-2 gap-2 p-3 pt-2">
                      {signals.map((signal) => {
                        const isSelected = selectedSignals.has(signal.id);

                        return (
                          <label
                            key={signal.id}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-small border cursor-pointer transition-all",
                              isSelected
                                ? "bg-accent/5 border-accent/30"
                                : "bg-white border-border-subtle hover:bg-background-secondary"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSignal(signal.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-small font-medium text-foreground truncate">
                                {signal.label}
                              </div>
                            </div>
                            <div
                              className={cn(
                                "text-small font-semibold tabular-nums",
                                isSelected ? "text-accent" : "text-muted-foreground"
                              )}
                            >
                              +{signal.points}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Score Breakdown */}
          {scoreResult.breakdown.length > 0 && (
            <div className="mt-4 p-4 bg-background-secondary rounded-medium">
              <div className="text-tiny uppercase tracking-wide text-muted-foreground mb-2">
                Score Breakdown
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {scoreResult.breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-small"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      +{item.points}
                    </span>
                  </div>
                ))}
                {scoreResult.bonuses.map((bonus, i) => (
                  <div
                    key={`bonus-${i}`}
                    className="flex items-center justify-between text-small"
                  >
                    <span className="text-success">🎯 {bonus.reason}</span>
                    <span className="font-medium text-success">+{bonus.points}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                <span className="font-medium text-foreground">Total Score</span>
                <span className="text-h3 font-bold text-foreground">
                  {scoreResult.score}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save & Calculate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

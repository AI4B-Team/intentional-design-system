import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  StickyNote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTransactionChecklist,
  ROADMAP_STAGES,
} from "@/hooks/useTransactionChecklist";
import { differenceInDays } from "date-fns";

interface TransactionRoadmapChecklistProps {
  dealId: string;
  /** Contract/creation date for computing days in stage */
  contractDate?: Date;
  /** Deal summary for sticky header */
  dealSummary?: {
    address: string;
    purchasePrice: number;
    arv: number;
    projectedProfit: number;
    closeDate?: string;
  };
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export function TransactionRoadmapChecklist({
  dealId,
  contractDate,
  dealSummary,
}: TransactionRoadmapChecklistProps) {
  const {
    loading,
    isItemChecked,
    toggleItem,
    stageNotes,
    updateStageNote,
    totalItems,
    completedItems,
    progressPercent,
    nextAction,
    refetch,
  } = useTransactionChecklist(dealId);

  const [expandedNotes, setExpandedNotes] = React.useState<Record<string, boolean>>({});

  const toggleNoteExpand = (stageId: string) => {
    setExpandedNotes((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  // Compute days in stage (simplified: days since contract date)
  const daysFromContract = contractDate
    ? differenceInDays(new Date(), contractDate)
    : 0;

  // Rough stage day estimates based on typical timelines
  const getStageDays = (stageIndex: number): number => {
    if (!contractDate) return 0;
    // Each stage roughly spans a portion of the deal
    const stageStarts = [0, 3, 7, 14, 25];
    const daysSinceStart = daysFromContract - (stageStarts[stageIndex] || 0);
    return Math.max(0, daysSinceStart);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky Deal Header */}
      {dealSummary && (
        <Card className="p-4 bg-card border sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold">{dealSummary.address}</span>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-muted-foreground">
              Purchase: <span className="font-medium text-foreground">{formatCurrency(dealSummary.purchasePrice)}</span>
            </span>
            <span className="text-muted-foreground">
              ARV: <span className="font-medium text-foreground">{formatCurrency(dealSummary.arv)}</span>
            </span>
            <span className="text-muted-foreground">
              Profit: <span className="font-medium text-success">{formatCurrency(dealSummary.projectedProfit)}</span>
            </span>
            {dealSummary.closeDate && (
              <span className="text-muted-foreground">
                Close: <span className="font-medium text-foreground">{dealSummary.closeDate}</span>
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {completedItems} Of {totalItems} Items Complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2.5" />
      </Card>

      {/* Next Action */}
      {nextAction && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Next Action</p>
              <p className="text-sm font-semibold mt-0.5">{nextAction.itemLabel}</p>
              <p className="text-xs text-muted-foreground">{nextAction.stageLabel} Stage</p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="flex-shrink-0"
              onClick={() => toggleItem(nextAction!.stage, nextAction!.itemKey)}
            >
              Mark Done
            </Button>
          </div>
        </Card>
      )}

      {/* Stages — horizontal scroll on mobile */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {ROADMAP_STAGES.map((stage, stageIndex) => {
            const stageCompleted = stage.items.filter((item) =>
              isItemChecked(stage.id, item.key)
            ).length;
            const allDone = stageCompleted === stage.items.length;
            const stageDays = getStageDays(stageIndex);

            return (
              <Card
                key={stage.id}
                className={cn(
                  "w-[260px] lg:w-auto flex-shrink-0 lg:flex-shrink flex flex-col",
                  allDone && "border-success/40 bg-success/5"
                )}
              >
                {/* Stage Header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{stage.emoji}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold truncate">{stage.label}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {stageCompleted}/{stage.items.length} Done
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {stageDays > 0 && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {stageDays}D
                      </Badge>
                    )}
                    {allDone && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="p-3 space-y-2 flex-1">
                  {stage.items.map((item) => {
                    const checked = isItemChecked(stage.id, item.key);
                    return (
                      <label
                        key={item.key}
                        className={cn(
                          "flex items-start gap-2.5 cursor-pointer group rounded-md p-1.5 -m-1.5 hover:bg-muted/50 transition-colors",
                          checked && "opacity-70"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleItem(stage.id, item.key)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span
                          className={cn(
                            "text-xs leading-snug",
                            checked && "line-through text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Notes Toggle */}
                <div className="border-t">
                  <button
                    onClick={() => toggleNoteExpand(stage.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <StickyNote className="h-3 w-3" />
                      Notes
                    </span>
                    {expandedNotes[stage.id] ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  {expandedNotes[stage.id] && (
                    <div className="px-3 pb-3">
                      <Textarea
                        placeholder="Add notes for this stage..."
                        className="text-xs min-h-[60px] resize-none"
                        value={stageNotes[stage.id] || ""}
                        onChange={(e) => updateStageNote(stage.id, e.target.value)}
                      />
                      <p className="text-[9px] text-muted-foreground mt-1">Auto-Saves</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

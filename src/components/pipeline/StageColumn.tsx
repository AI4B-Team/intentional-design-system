import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, MoreVertical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineDeal } from "@/hooks/usePipelineDeals";
import type { PipelineStageConfig } from "./pipeline-config";
import { PIPELINE_STAGES } from "./pipeline-config";
import { PipelineDealCard } from "./PipelineDealCard";
import { EmptyStageGuide } from "./EmptyStageGuide";

function SortableDealCard({
  deal,
  stageConfig,
  nextStage,
  prevStage,
  onView,
  onMove,
}: {
  deal: PipelineDeal;
  stageConfig: PipelineStageConfig;
  nextStage?: PipelineStageConfig;
  prevStage?: PipelineStageConfig;
  onView: () => void;
  onMove: (newStage: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PipelineDealCard
        deal={deal}
        stageConfig={stageConfig}
        nextStage={nextStage}
        prevStage={prevStage}
        onView={onView}
        onMove={onMove}
      />
    </div>
  );
}

interface StageColumnProps {
  stage: PipelineStageConfig;
  deals: PipelineDeal[];
  allDeals: PipelineDeal[];
  onViewDeal: (deal: PipelineDeal) => void;
  onMoveDeal: (dealId: string, newStage: string) => void;
  onAddDeal: (stageId: string) => void;
  isDropTarget: boolean;
  activeDragId: string | null;
}

export function StageColumn({
  stage,
  deals,
  allDeals,
  onViewDeal,
  onMoveDeal,
  onAddDeal,
  isDropTarget,
  activeDragId,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { stageId: stage.id },
  });

  const isDragSource = activeDragId ? deals.some(d => d.id === activeDragId) : false;
  const totalValue = deals.reduce((sum, d) => sum + (d.offer_amount || d.asking_price), 0);
  const avgDaysInStage = deals.length > 0
    ? Math.round(deals.reduce((sum, d) => sum + d.days_in_stage, 0) / deals.length)
    : 0;
  const overdueCount = deals.filter(d => d.days_in_stage > stage.targetDays && stage.targetDays > 0).length;
  const dealIds = deals.map(d => d.id);
  const showDropIndicator = isDropTarget && !isDragSource;

  return (
    <div className="flex-shrink-0 w-72" data-stage-id={stage.id}>
      <div className={cn(
        "bg-surface-secondary rounded-lg border transition-all duration-200",
        showDropIndicator
          ? "border-brand border-2 bg-brand/10 shadow-xl ring-2 ring-brand/30"
          : isOver
            ? "border-primary border-2 bg-primary/5 shadow-lg"
            : "border-border-subtle",
        isDragSource && activeDragId && "opacity-75"
      )}>
        {/* Stage Header */}
        <div className="p-3 border-b border-border-subtle">
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white dark:bg-card px-3 py-1.5 rounded-md shadow-sm border border-border-subtle">
              <div className="flex items-center gap-2">
                <stage.icon className={cn(
                  "h-4 w-4",
                  stage.category === "discovery" && "text-red-500",
                  stage.category === "intent" && "text-amber-500",
                  stage.category === "commitment" && "text-blue-500",
                  stage.category === "outcome" && "text-emerald-500"
                )} />
                <span className="text-small font-semibold">{stage.label}</span>
                <Badge variant="secondary" size="sm">{deals.length}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors"
                        onClick={(e) => { e.stopPropagation(); onAddDeal(stage.id); }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-tiny">Add deal to {stage.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAddDeal(stage.id)}>Add Deal</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View All in {stage.label}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {deals.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <span className="text-tiny text-muted-foreground font-mono tabular-nums">
                  ${totalValue >= 1000000
                    ? `${(totalValue / 1000000).toFixed(1)}M`
                    : totalValue >= 1000
                    ? `${(totalValue / 1000).toFixed(0)}K`
                    : totalValue.toLocaleString()}
                </span>
                {overdueCount > 0 ? (
                  <span className="text-tiny text-destructive font-medium">{overdueCount} overdue</span>
                ) : (
                  <span className="text-tiny text-muted-foreground">avg {avgDaysInStage}d</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Deals */}
        <div
          ref={setNodeRef}
          className={cn(
            "p-2 pr-4 space-y-2 min-h-[100px] transition-all duration-200",
            showDropIndicator && "bg-brand/5",
            isOver && !showDropIndicator && "bg-primary/5"
          )}
        >
          {showDropIndicator && (
            <div className="flex items-center gap-2 p-3 border-2 border-dashed border-brand rounded-lg bg-brand/10 mb-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-sm font-medium text-brand">Drop here</span>
            </div>
          )}

          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            {deals.length === 0 && !showDropIndicator ? (
              <div className={cn("transition-all duration-200", isOver && "opacity-50")}>
                <EmptyStageGuide stageId={stage.id} />
              </div>
            ) : (
              deals.map((deal) => {
                const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === deal.stage);
                const nextStage = PIPELINE_STAGES[currentStageIndex + 1];
                const prevStage = PIPELINE_STAGES[currentStageIndex - 1];
                return (
                  <SortableDealCard
                    key={deal.id}
                    deal={deal}
                    stageConfig={stage}
                    nextStage={nextStage}
                    prevStage={prevStage}
                    onView={() => onViewDeal(deal)}
                    onMove={(newStage) => onMoveDeal(deal.id, newStage)}
                  />
                );
              })
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  TransactionStageId, 
  TRANSACTION_STAGES, 
  ACTIVE_STAGES,
  getStageConfig 
} from "@/lib/transaction-stages";
import { CheckCircle2, Circle, Lock } from "lucide-react";

interface TCPipelineProgressProps {
  currentStage: TransactionStageId;
  onStageClick?: (stage: TransactionStageId) => void;
  completedStages?: TransactionStageId[];
  className?: string;
}

export function TCPipelineProgress({
  currentStage,
  onStageClick,
  completedStages = [],
  className,
}: TCPipelineProgressProps) {
  const currentOrder = TRANSACTION_STAGES[currentStage]?.order || 1;

  const getStageStatus = (stageId: TransactionStageId) => {
    if (completedStages.includes(stageId)) return "completed";
    if (stageId === currentStage) return "active";
    const stageOrder = TRANSACTION_STAGES[stageId].order;
    if (stageOrder < currentOrder) return "completed";
    return "locked";
  };

  const getStatusIcon = (status: "completed" | "active" | "locked") => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "active":
        return <Circle className="h-4 w-4 text-primary fill-primary/20" />;
      default:
        return <Lock className="h-4 w-4 text-muted-foreground/50" />;
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {ACTIVE_STAGES.map((stageId, index) => {
        const stage = getStageConfig(stageId);
        const status = getStageStatus(stageId);
        const isClickable = status !== "locked" && onStageClick;

        return (
          <React.Fragment key={stageId}>
            <button
              onClick={() => isClickable && onStageClick(stageId)}
              disabled={status === "locked"}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                status === "active" && "bg-primary/10 ring-1 ring-primary/30",
                status === "completed" && "bg-success/10",
                status === "locked" && "opacity-50 cursor-not-allowed",
                status !== "locked" && isClickable && "hover:bg-muted cursor-pointer"
              )}
            >
              {getStatusIcon(status)}
              <div className="hidden lg:block text-left">
                <span className={cn(
                  "text-sm font-medium",
                  status === "active" && "text-primary",
                  status === "completed" && "text-success"
                )}>
                  {stage.shortLabel}
                </span>
              </div>
            </button>
            {index < ACTIVE_STAGES.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 rounded-full min-w-4",
                  status === "completed" || TRANSACTION_STAGES[ACTIVE_STAGES[index + 1]].order <= currentOrder
                    ? "bg-success"
                    : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface TCStageCompactProps {
  stage: TransactionStageId;
  className?: string;
}

export function TCStageCompact({ stage, className }: TCStageCompactProps) {
  const config = getStageConfig(stage);
  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1.5", config.bgColor, config.color, config.borderColor, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

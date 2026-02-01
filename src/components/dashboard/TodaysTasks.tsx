import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar,
  Check,
  Inbox,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useFocusTasks, type TaskItem } from "@/hooks/useFocusTasks";

const priorityDotColors = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-muted-foreground/50",
};

interface TaskRowProps {
  task: TaskItem;
  onToggle: () => void;
  onClick: () => void;
  index: number;
}

function TaskRow({ task, onToggle, onClick, index }: TaskRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all animate-fade-in",
        task.completed ? "opacity-50" : "hover:bg-background-secondary cursor-pointer"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={task.completed ? undefined : onClick}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 shrink-0",
          task.completed
            ? "bg-success border-success"
            : "border-border hover:border-success"
        )}
      >
        {task.completed && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Priority Dot */}
      <div
        className={cn(
          "h-2 w-2 rounded-full shrink-0",
          priorityDotColors[task.priority]
        )}
        title={`${task.priority} priority`}
      />

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-small transition-all duration-200 block truncate",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>
      </div>

      {/* Time Badge */}
      {task.time && (
        <span className={cn(
          "text-tiny rounded-full px-2 py-0.5 shrink-0 flex items-center gap-1",
          task.completed 
            ? "bg-muted text-muted-foreground" 
            : "bg-surface-tertiary text-content-secondary"
        )}>
          <Clock className="h-3 w-3" />
          {task.time}
        </span>
      )}

      {/* Focus Eligible Badge */}
      {task.isEligibleForFocus && !task.completed && (
        <span className="text-tiny bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0 font-medium">
          Focus
        </span>
      )}
    </div>
  );
}

export function TodaysTasks() {
  const navigate = useNavigate();
  const { taskItems, toggleTaskComplete, isLoading } = useFocusTasks();

  const remainingCount = taskItems.filter(t => !t.completed).length;
  const completedCount = taskItems.filter(t => t.completed).length;
  const allComplete = taskItems.length > 0 && remainingCount === 0;

  if (isLoading) {
    return (
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-muted">
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Demo tasks if no real data
  const displayTasks = taskItems.length > 0 ? taskItems : [
    {
      id: "demo-1",
      type: "appointment" as const,
      title: "Property Walkthrough - 1842 Sunset Boulevard",
      time: "10:00 AM",
      propertyId: "demo-1",
      propertyAddress: "1842 Sunset Boulevard",
      completed: false,
      priority: "high" as const,
      urgencyScore: 75,
      isEligibleForFocus: true,
    },
    {
      id: "demo-2",
      type: "followup" as const,
      title: "Follow up on 3921 Maple Street",
      time: "11:30 AM",
      propertyId: "demo-2",
      propertyAddress: "3921 Maple Street",
      completed: false,
      priority: "medium" as const,
      urgencyScore: 60,
      isEligibleForFocus: true,
    },
    {
      id: "demo-3",
      type: "appointment" as const,
      title: "Seller Meeting - 7845 Oak Avenue",
      time: "2:00 PM",
      propertyId: "demo-3",
      propertyAddress: "7845 Oak Avenue",
      completed: false,
      priority: "high" as const,
      urgencyScore: 70,
      isEligibleForFocus: true,
    },
    {
      id: "demo-4",
      type: "followup" as const,
      title: "Send offer to 2156 Cherry Lane",
      time: "3:30 PM",
      propertyId: "demo-4",
      propertyAddress: "2156 Cherry Lane",
      completed: false,
      priority: "low" as const,
      urgencyScore: 40,
      isEligibleForFocus: false,
    },
    {
      id: "demo-5",
      type: "appointment" as const,
      title: "Inspection - 9023 Birch Court",
      time: "5:00 PM",
      propertyId: "demo-5",
      propertyAddress: "9023 Birch Court",
      completed: false,
      priority: "medium" as const,
      urgencyScore: 55,
      isEligibleForFocus: true,
    },
  ];

  const actualRemaining = displayTasks.filter(t => !t.completed).length;

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      {/* Header - Calm, operational */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-muted">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-body font-semibold text-foreground">Today's Tasks</h2>
        </div>
        <span className="text-small font-medium px-2.5 py-1 rounded-full bg-background-secondary text-muted-foreground tabular-nums">
          {actualRemaining} Remaining
        </span>
      </div>

      {/* Task List */}
      <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
        {allComplete || displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mb-3">
              <Inbox className="h-7 w-7 text-success" />
            </div>
            <h4 className="text-body font-semibold text-foreground mb-1">All caught up!</h4>
            <p className="text-small text-muted-foreground">
              You've completed all your tasks for today.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {displayTasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTaskComplete(task.id)}
                onClick={() => navigate(`/properties/${task.propertyId}`)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div 
        className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors"
        onClick={() => navigate("/tasks?filter=due_date")}
      >
        <span>View All Tasks</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Card>
  );
}

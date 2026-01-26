import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Inbox } from "lucide-react";

interface Task {
  id: string | number;
  title: string;
  time?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface TasksListProps {
  tasks: Task[];
  onToggle: (id: string | number) => void;
  className?: string;
}

const priorityColors = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-info",
};

export function TasksList({ tasks, onToggle, className }: TasksListProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  if (tasks.length === 0 || allCompleted) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
          <Inbox className="h-8 w-8 text-success" />
        </div>
        <h4 className="text-h3 font-semibold text-content mb-1">All caught up!</h4>
        <p className="text-small text-content-secondary">
          You've completed all your tasks for today.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-medium transition-all animate-fade-in",
            task.completed ? "opacity-60" : "hover:bg-surface-secondary"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Custom Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-small border-2 transition-all duration-200",
              task.completed
                ? "bg-brand-accent border-brand-accent"
                : "border-border hover:border-brand-accent"
            )}
          >
            {task.completed && <Check className="h-3 w-3 text-white" />}
          </button>

          {/* Priority Dot */}
          <div
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              priorityColors[task.priority]
            )}
          />

          {/* Task Text */}
          <span
            className={cn(
              "flex-1 text-body transition-all duration-200",
              task.completed && "line-through text-content-tertiary"
            )}
          >
            {task.title}
          </span>

          {/* Time Badge */}
          {task.time && (
            <span className="text-tiny bg-surface-tertiary text-content-secondary rounded-full px-2 py-0.5">
              {task.time}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

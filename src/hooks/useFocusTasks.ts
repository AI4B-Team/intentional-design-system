import * as React from "react";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";
import { useTodaysTasks, type TodayTask } from "@/hooks/useTodaysTasks";
import { useUnifiedActions, useCompleteAction, type UnifiedAction } from "@/hooks/useUnifiedActions";

// Focus/Tasks priority system for dashboard
// Now reads from unified_actions as primary source, with insight-based fallback

export type FocusPriority = "critical" | "high" | "medium" | "low";

export interface FocusItem {
  id: string;
  type: "lead_contact" | "offer_followup" | "hot_deal" | "stalling" | "appointment" | "task";
  title: string;
  subtitle?: string;
  propertyId?: string;
  propertyAddress?: string;
  time?: string | null;
  priority: FocusPriority;
  urgencyScore: number;
  source: "insight" | "task" | "unified";
  completed: boolean;
  actionLabel?: string;
  actionRoute?: string;
  unifiedActionId?: string; // Link back to unified_actions table
}

export interface TaskItem {
  id: string;
  type: "appointment" | "followup" | "task";
  title: string;
  time?: string | null;
  propertyId: string;
  propertyAddress: string;
  completed: boolean;
  priority: FocusPriority;
  urgencyScore: number;
  isEligibleForFocus: boolean;
  unifiedActionId?: string;
}

const MAX_FOCUS_ITEMS = 2;

// Map unified action to FocusItem
function unifiedToFocusItem(action: UnifiedAction): FocusItem {
  const typeMap: Record<string, FocusItem["type"]> = {
    call: "lead_contact",
    follow_up: "offer_followup",
    appointment: "appointment",
    deadline: "hot_deal",
    task: "task",
  };

  const priorityToScore: Record<string, number> = {
    critical: 95,
    high: 80,
    medium: 60,
    low: 40,
  };

  return {
    id: action.id,
    type: typeMap[action.type] || "task",
    title: action.title,
    subtitle: action.description || action.property_address || undefined,
    propertyId: action.property_id || undefined,
    propertyAddress: action.property_address || undefined,
    time: action.due_at ? new Date(action.due_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null,
    priority: action.priority as FocusPriority,
    urgencyScore: priorityToScore[action.priority] || 50,
    source: "unified",
    completed: action.status === "completed",
    actionLabel: action.type === "call" ? "Call Now" : action.type === "follow_up" ? "Follow Up" : "View",
    actionRoute: action.property_id ? `/properties/${action.property_id}` : undefined,
    unifiedActionId: action.id,
  };
}

// Map unified action to TaskItem
function unifiedToTaskItem(action: UnifiedAction): TaskItem {
  const priorityToScore: Record<string, number> = {
    critical: 95,
    high: 80,
    medium: 60,
    low: 40,
  };

  return {
    id: action.id,
    type: action.type === "appointment" ? "appointment" : action.type === "follow_up" ? "followup" : "task",
    title: action.title,
    time: action.due_at ? new Date(action.due_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null,
    propertyId: action.property_id || "",
    propertyAddress: action.property_address || "",
    completed: action.status === "completed",
    priority: action.priority as FocusPriority,
    urgencyScore: priorityToScore[action.priority] || 50,
    isEligibleForFocus: action.priority === "critical" || action.priority === "high",
    unifiedActionId: action.id,
  };
}

function calculateTaskUrgency(task: TodayTask): number {
  let score = 50;
  if (task.type === "appointment") {
    score += 30;
    if (task.time) {
      const now = new Date();
      const timeMatch = task.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const isPM = timeMatch[3].toUpperCase() === "PM";
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        const appointmentMinutes = hours * 60 + minutes;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const minutesUntil = appointmentMinutes - nowMinutes;
        if (minutesUntil > 0 && minutesUntil <= 60) score += 20;
        else if (minutesUntil > 0 && minutesUntil <= 120) score += 10;
      }
    }
  }
  if (task.type === "followup") score += 15;
  return Math.min(score, 100);
}

function isEligibleForFocus(task: TodayTask, urgencyScore: number): boolean {
  if (task.type === "appointment") return true;
  if (urgencyScore >= 65) return true;
  if (task.type === "followup" && urgencyScore >= 50) return true;
  return false;
}

export function useFocusTasks() {
  const { data: insights, isLoading: insightsLoading } = useDashboardInsights();
  const { data: todaysTasks, isLoading: tasksLoading } = useTodaysTasks();
  
  // Pull from unified_actions (the canonical source)
  const { data: unifiedActions, isLoading: unifiedLoading } = useUnifiedActions({
    status: ["pending", "overdue"],
    limit: 20,
  });

  const completeAction = useCompleteAction();
  
  const [completedFocusIds, setCompletedFocusIds] = React.useState<Set<string>>(new Set());

  const { focusItems, taskItems } = React.useMemo(() => {
    const allFocusItems: FocusItem[] = [];
    const allTaskItems: TaskItem[] = [];
    const seenIds = new Set<string>();

    // 1. PRIMARY: Unified actions (canonical source)
    if (unifiedActions && unifiedActions.length > 0) {
      unifiedActions.forEach((action) => {
        seenIds.add(action.id);
        
        // Add to focus if high priority
        if (action.priority === "critical" || action.priority === "high") {
          allFocusItems.push(unifiedToFocusItem(action));
        }
        
        // Always add to task list
        allTaskItems.push(unifiedToTaskItem(action));
      });
    }

    // 2. FALLBACK: Insight-based focus items (when no unified actions exist)
    if (allFocusItems.length === 0 && insights) {
      if (insights.leadsInsight?.count && insights.leadsInsight.count > 0) {
        const count = insights.leadsInsight.count;
        allFocusItems.push({
          id: "focus-leads-contact",
          type: "lead_contact",
          title: `${count} Lead${count > 1 ? "s" : ""} Need${count === 1 ? "s" : ""} First Contact`,
          subtitle: "No outreach yet",
          time: count > 3 ? "Overdue" : "Added Today",
          priority: count > 5 ? "critical" : "high",
          urgencyScore: count > 5 ? 95 : 85,
          source: "insight",
          completed: completedFocusIds.has("focus-leads-contact"),
          actionLabel: "Call Now",
          actionRoute: "/properties?status=new&sort=created_at",
        });
      }

      if (insights.offersInsight?.count && insights.offersInsight.count > 0) {
        const count = insights.offersInsight.count;
        allFocusItems.push({
          id: "focus-offers-pending",
          type: "offer_followup",
          title: `${count} Offer${count > 1 ? "s" : ""} Awaiting Response`,
          subtitle: "Follow up needed",
          time: "Waiting 2 Days",
          priority: count > 3 ? "critical" : "high",
          urgencyScore: count > 3 ? 90 : 80,
          source: "insight",
          completed: completedFocusIds.has("focus-offers-pending"),
          actionLabel: "Follow Up",
          actionRoute: "/properties?status=offer_made",
        });
      }

      if (insights.stallingCount > 0) {
        const count = insights.stallingCount;
        allFocusItems.push({
          id: "focus-stalling",
          type: "stalling",
          title: `${count} Deal${count > 1 ? "s" : ""} Stalling`,
          subtitle: "No activity recently",
          time: "Overdue",
          priority: "medium",
          urgencyScore: 60,
          source: "insight",
          completed: completedFocusIds.has("focus-stalling"),
          actionLabel: "Re-Engage",
          actionRoute: "/properties?status=contacted&sort=updated_at",
        });
      }
    }

    // 3. FALLBACK: Today's tasks from legacy hooks (when not in unified_actions)
    if (allTaskItems.length === 0 && todaysTasks) {
      todaysTasks.forEach((task) => {
        if (seenIds.has(task.id)) return;
        const urgencyScore = calculateTaskUrgency(task);
        const eligible = isEligibleForFocus(task, urgencyScore);
        
        allTaskItems.push({
          id: task.id,
          type: task.type === "appointment" ? "appointment" : "followup",
          title: task.title,
          time: task.time,
          propertyId: task.propertyId,
          propertyAddress: task.propertyAddress,
          completed: task.completed || completedFocusIds.has(task.id),
          priority: urgencyScore >= 80 ? "critical" : urgencyScore >= 65 ? "high" : urgencyScore >= 50 ? "medium" : "low",
          urgencyScore,
          isEligibleForFocus: eligible,
        });

        if (eligible && !task.completed) {
          allFocusItems.push({
            id: task.id,
            type: task.type === "appointment" ? "appointment" : "task",
            title: task.title,
            subtitle: task.propertyAddress,
            propertyId: task.propertyId,
            propertyAddress: task.propertyAddress,
            time: task.time,
            priority: urgencyScore >= 80 ? "critical" : urgencyScore >= 65 ? "high" : "medium",
            urgencyScore,
            source: "task",
            completed: task.completed || completedFocusIds.has(task.id),
            actionRoute: `/properties/${task.propertyId}`,
          });
        }
      });
    }

    // 4. Sort & cap focus items
    const sortedFocusItems = allFocusItems
      .filter(item => !item.completed)
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, MAX_FOCUS_ITEMS);

    // 5. Demo fill if needed
    const demoFillItems: FocusItem[] = [
      {
        id: "demo-offers-pending",
        type: "offer_followup",
        title: "2 Offers Awaiting Response",
        subtitle: "Follow up needed",
        time: "Waiting 2 Days",
        priority: "high",
        urgencyScore: 80,
        source: "insight",
        completed: false,
        actionLabel: "Follow Up",
        actionRoute: "/properties?status=offer_made",
      },
      {
        id: "demo-stalling",
        type: "stalling",
        title: "3 Deals Stalling",
        subtitle: "No activity recently",
        time: "Waiting 2 Days",
        priority: "medium",
        urgencyScore: 60,
        source: "insight",
        completed: false,
        actionLabel: "Re-Engage",
        actionRoute: "/properties?status=contacted",
      },
    ];

    const finalFocusItems = [...sortedFocusItems];
    let demoIndex = 0;
    while (finalFocusItems.length < MAX_FOCUS_ITEMS && demoIndex < demoFillItems.length) {
      const demoItem = demoFillItems[demoIndex];
      const hasType = finalFocusItems.some(item => item.type === demoItem.type);
      if (!hasType) finalFocusItems.push(demoItem);
      demoIndex++;
    }

    // 6. Sort task items
    const sortedTaskItems = allTaskItems.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.urgencyScore - a.urgencyScore;
    });

    return { focusItems: finalFocusItems, taskItems: sortedTaskItems };
  }, [insights, todaysTasks, unifiedActions, completedFocusIds]);

  const completeFocusItem = React.useCallback((itemId: string) => {
    // If it's a unified action, mark it complete in the DB
    const item = focusItems.find(f => f.id === itemId);
    if (item?.unifiedActionId) {
      completeAction.mutate(item.unifiedActionId);
    }
    setCompletedFocusIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, [focusItems, completeAction]);

  const toggleTaskComplete = React.useCallback((taskId: string) => {
    // If it's a unified action, toggle in DB
    const task = taskItems.find(t => t.id === taskId);
    if (task?.unifiedActionId && !task.completed) {
      completeAction.mutate(task.unifiedActionId);
    }
    setCompletedFocusIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, [taskItems, completeAction]);

  const allFocusComplete = focusItems.length === 0;

  return {
    focusItems,
    taskItems,
    completeFocusItem,
    toggleTaskComplete,
    allFocusComplete,
    isLoading: insightsLoading || tasksLoading || unifiedLoading,
    completedCount: completedFocusIds.size,
  };
}

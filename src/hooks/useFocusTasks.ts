import * as React from "react";
import { useDashboardInsights, type HotOpportunityEnhanced } from "@/hooks/useDashboardInsights";
import { useTodaysTasks, type TodayTask } from "@/hooks/useTodaysTasks";

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
  urgencyScore: number; // 0-100, higher = more urgent
  source: "insight" | "task"; // Where it came from
  completed: boolean;
  actionLabel?: string;
  actionRoute?: string;
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
  isEligibleForFocus: boolean; // Whether it can promote to Focus
}

const MAX_FOCUS_ITEMS = 3;

/**
 * Calculate urgency score for a task
 * Higher score = more urgent
 */
function calculateTaskUrgency(task: TodayTask): number {
  let score = 50; // Base score

  // Appointments are more urgent
  if (task.type === "appointment") {
    score += 30;
    
    // Time-based urgency - appointments earlier in the day are more urgent
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
        
        // More urgent if appointment is soon
        const minutesUntil = appointmentMinutes - nowMinutes;
        if (minutesUntil > 0 && minutesUntil <= 60) {
          score += 20; // Very soon
        } else if (minutesUntil > 0 && minutesUntil <= 120) {
          score += 10; // Coming up
        }
      }
    }
  }

  // Follow-ups have moderate urgency
  if (task.type === "followup") {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Determine if a task is eligible to promote to Focus
 * Only high-priority, time-sensitive, or blocking tasks qualify
 */
function isEligibleForFocus(task: TodayTask, urgencyScore: number): boolean {
  // Appointments are always eligible (time-sensitive)
  if (task.type === "appointment") return true;
  
  // High urgency tasks are eligible
  if (urgencyScore >= 65) return true;
  
  // Follow-ups that might be blocking deals
  if (task.type === "followup" && urgencyScore >= 50) return true;
  
  return false;
}

export function useFocusTasks() {
  const { data: insights, isLoading: insightsLoading } = useDashboardInsights();
  const { data: todaysTasks, isLoading: tasksLoading } = useTodaysTasks();
  
  // Local state for completed focus items (persists in session)
  const [completedFocusIds, setCompletedFocusIds] = React.useState<Set<string>>(new Set());

  // Build focus items from insights and tasks
  const { focusItems, taskItems } = React.useMemo(() => {
    const allFocusItems: FocusItem[] = [];
    const allTaskItems: TaskItem[] = [];

    // 1. Build focus candidates from insights
    if (insights) {
      // Leads needing first contact (Critical priority)
      if (insights.leadsInsight?.count && insights.leadsInsight.count > 0) {
        allFocusItems.push({
          id: "focus-leads-contact",
          type: "lead_contact",
          title: `${insights.leadsInsight.count} Lead${insights.leadsInsight.count > 1 ? "s" : ""} Need First Contact`,
          subtitle: "No outreach yet",
          priority: insights.leadsInsight.count > 5 ? "critical" : "high",
          urgencyScore: insights.leadsInsight.count > 5 ? 95 : 85,
          source: "insight",
          completed: completedFocusIds.has("focus-leads-contact"),
          actionLabel: "Call Now",
          actionRoute: "/properties?status=new&sort=created_at",
        });
      }

      // Offers awaiting response (High priority)
      if (insights.offersInsight?.count && insights.offersInsight.count > 0) {
        allFocusItems.push({
          id: "focus-offers-pending",
          type: "offer_followup",
          title: `${insights.offersInsight.count} Offer${insights.offersInsight.count > 1 ? "s" : ""} Awaiting Response`,
          subtitle: "Follow up needed",
          priority: insights.offersInsight.count > 3 ? "critical" : "high",
          urgencyScore: insights.offersInsight.count > 3 ? 90 : 80,
          source: "insight",
          completed: completedFocusIds.has("focus-offers-pending"),
          actionLabel: "Follow Up",
          actionRoute: "/properties?status=offer_made",
        });
      }

      // Hot deals (High priority)
      const hotDeals = insights.hotOpportunities?.filter(
        (opp) => opp.urgency_reason?.includes("🔥") || opp.deal_score_rank === "🏆 Top Deal"
      );
      if (hotDeals && hotDeals.length > 0) {
        allFocusItems.push({
          id: "focus-hot-deals",
          type: "hot_deal",
          title: `${hotDeals.length} Hot Deal${hotDeals.length > 1 ? "s" : ""} Need Action`,
          subtitle: "High momentum opportunities",
          priority: "high",
          urgencyScore: 75,
          source: "insight",
          completed: completedFocusIds.has("focus-hot-deals"),
          actionLabel: "View Deals",
          actionRoute: "/pipeline",
        });
      }

      // Stalling deals (Medium priority)
      if (insights.stallingCount > 0) {
        allFocusItems.push({
          id: "focus-stalling",
          type: "stalling",
          title: `${insights.stallingCount} Deal${insights.stallingCount > 1 ? "s" : ""} Stalling`,
          subtitle: "No activity recently",
          priority: "medium",
          urgencyScore: 60,
          source: "insight",
          completed: completedFocusIds.has("focus-stalling"),
          actionLabel: "Re-Engage",
          actionRoute: "/properties?status=contacted&sort=updated_at",
        });
      }
    }

    // 2. Build task items from today's tasks
    if (todaysTasks) {
      todaysTasks.forEach((task) => {
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

        // Add eligible tasks to focus candidates
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

    // 3. Sort focus items by urgency (highest first) and take top 3 incomplete
    const sortedFocusItems = allFocusItems
      .filter(item => !item.completed)
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, MAX_FOCUS_ITEMS);

    // 4. Sort task items - uncompleted first, then by urgency
    const sortedTaskItems = allTaskItems.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.urgencyScore - a.urgencyScore;
    });

    return {
      focusItems: sortedFocusItems,
      taskItems: sortedTaskItems,
    };
  }, [insights, todaysTasks, completedFocusIds]);

  // Mark a focus item as complete
  const completeFocusItem = React.useCallback((itemId: string) => {
    setCompletedFocusIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, []);

  // Toggle task completion (syncs with focus if applicable)
  const toggleTaskComplete = React.useCallback((taskId: string) => {
    setCompletedFocusIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // Check if all focus items are complete
  const allFocusComplete = focusItems.length === 0;

  return {
    focusItems,
    taskItems,
    completeFocusItem,
    toggleTaskComplete,
    allFocusComplete,
    isLoading: insightsLoading || tasksLoading,
    completedCount: completedFocusIds.size,
  };
}

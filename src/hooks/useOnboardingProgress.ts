import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface OnboardingTask {
  id: string;
  label: string;
  description: string;
  points: number;
  completed: boolean;
  route?: string;
  category: "setup" | "deals" | "automation";
}

const ONBOARDING_TASKS: Omit<OnboardingTask, "completed">[] = [
  { id: "profile", label: "Complete Your Profile", description: "Add your name, phone, and photo", points: 50, route: "/settings", category: "setup" },
  { id: "vendors", label: "Set Up Your Vendors", description: "Add title company, lender, and agent", points: 100, route: "/settings?tab=account-defaults", category: "setup" },
  { id: "documents", label: "Upload Default Documents", description: "Add your contract templates or LOI", points: 100, route: "/settings?tab=documents", category: "setup" },
  { id: "integrations", label: "Connect Integrations", description: "Link GHL, Closebot, or other tools", points: 75, route: "/settings/integrations", category: "automation" },
  { id: "first_property", label: "Add Your First Property", description: "Start tracking deals in your pipeline", points: 100, route: "/pipeline", category: "deals" },
  { id: "buy_box", label: "Create a Buy Box", description: "Define your ideal deal criteria", points: 75, route: "/marketplace/buy-box", category: "deals" },
];

export function useOnboardingProgress() {
  const { user } = useAuth();

  // For now, use localStorage to track completion. Later migrate to DB.
  const storageKey = `realelite_onboarding_${user?.id}`;

  const [completedTasks, setCompletedTasks] = React.useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const tasks: OnboardingTask[] = ONBOARDING_TASKS.map(t => ({
    ...t,
    completed: completedTasks.includes(t.id),
  }));

  const totalPoints = ONBOARDING_TASKS.reduce((s, t) => s + t.points, 0);
  const earnedPoints = tasks.filter(t => t.completed).reduce((s, t) => s + t.points, 0);
  const progress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;
  const isComplete = progress === 100;

  const completeTask = React.useCallback((taskId: string) => {
    setCompletedTasks(prev => {
      if (prev.includes(taskId)) return prev;
      const next = [...prev, taskId];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const dismissOnboarding = React.useCallback(() => {
    localStorage.setItem(`${storageKey}_dismissed`, "true");
  }, [storageKey]);

  const isDismissed = React.useMemo(() => {
    return localStorage.getItem(`${storageKey}_dismissed`) === "true";
  }, [storageKey]);

  return {
    tasks,
    completedTasks,
    totalPoints,
    earnedPoints,
    progress,
    isComplete,
    completeTask,
    dismissOnboarding,
    isDismissed,
  };
}

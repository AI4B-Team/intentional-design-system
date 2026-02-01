import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AutoRule {
  id: string;
  name: string;
  description: string;
  trigger: AutoRuleTrigger;
  action: AutoRuleAction;
  isActive: boolean;
  isSystem: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface AutoRuleTrigger {
  type: "stage_stall" | "stage_entered" | "score_threshold" | "days_without_activity";
  stage?: string;
  days?: number;
  scoreThreshold?: number;
  comparison?: "above" | "below";
}

export interface AutoRuleAction {
  type: "create_task" | "send_notification" | "draft_followup" | "create_timeline" | "move_stage";
  taskTitle?: string;
  notificationMessage?: string;
  targetStage?: string;
  priority?: "low" | "medium" | "high";
}

// Predefined system rules
const SYSTEM_RULES: Omit<AutoRule, "id" | "lastTriggered" | "triggerCount">[] = [
  {
    name: "Contacted Stall Alert",
    description: "If Contacted = 0 for 24h → auto-task created",
    trigger: { type: "stage_stall", stage: "contacted", days: 1 },
    action: { type: "create_task", taskTitle: "Follow up with contacted leads", priority: "high" },
    isActive: true,
    isSystem: true,
  },
  {
    name: "Negotiation Follow-up",
    description: "If Negotiating > 7 days → AI follow-up drafted",
    trigger: { type: "stage_stall", stage: "negotiating", days: 7 },
    action: { type: "draft_followup", priority: "high" },
    isActive: true,
    isSystem: true,
  },
  {
    name: "Contract Timeline Builder",
    description: "If Under Contract added → timeline + reminders auto-built",
    trigger: { type: "stage_entered", stage: "under_contract" },
    action: { type: "create_timeline" },
    isActive: true,
    isSystem: true,
  },
  {
    name: "Hot Lead Alert",
    description: "If motivation score > 800 → immediate notification",
    trigger: { type: "score_threshold", scoreThreshold: 800, comparison: "above" },
    action: { type: "send_notification", notificationMessage: "Hot lead detected! Take action now.", priority: "high" },
    isActive: true,
    isSystem: true,
  },
  {
    name: "Offer Response Reminder",
    description: "If Offer Made > 3 days → follow-up task created",
    trigger: { type: "stage_stall", stage: "offer_made", days: 3 },
    action: { type: "create_task", taskTitle: "Follow up on pending offer", priority: "medium" },
    isActive: true,
    isSystem: true,
  },
  {
    name: "Appointment Prep",
    description: "When appointment scheduled → prep checklist created",
    trigger: { type: "stage_entered", stage: "appointment" },
    action: { type: "create_task", taskTitle: "Prepare for upcoming appointment", priority: "medium" },
    isActive: false,
    isSystem: true,
  },
];

// Evaluate rules against current data
interface RuleEvaluation {
  rule: AutoRule;
  matchCount: number;
  matchedProperties: Array<{
    id: string;
    address: string;
    daysInStage: number;
    score?: number;
  }>;
  wouldTrigger: boolean;
}

export function useAutoRules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Load rules (system + user custom - stored in localStorage for now)
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["auto-rules", user?.id],
    queryFn: async (): Promise<AutoRule[]> => {
      // Load user preferences from localStorage
      const savedPrefs = localStorage.getItem(`auto-rules-prefs-${user?.id}`);
      const prefs: Record<string, boolean> = savedPrefs ? JSON.parse(savedPrefs) : {};

      // Merge system rules with user preferences
      return SYSTEM_RULES.map((rule, index) => ({
        ...rule,
        id: `system-${index}`,
        isActive: prefs[`system-${index}`] !== undefined ? prefs[`system-${index}`] : rule.isActive,
        lastTriggered: undefined,
        triggerCount: 0,
      }));
    },
    enabled: !!user?.id,
  });

  // Evaluate rules against current pipeline state
  const { data: evaluations = [], isLoading: isEvaluating } = useQuery({
    queryKey: ["auto-rules-evaluations", user?.id],
    queryFn: async (): Promise<RuleEvaluation[]> => {
      // Fetch properties with stage timing
      const { data: properties, error } = await supabase
        .from("properties")
        .select("id, address, status, motivation_score, updated_at, created_at")
        .not("status", "in", "(sold,closed)")
        .order("updated_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!properties) return [];

      const now = new Date();

      return rules.filter(r => r.isActive).map((rule) => {
        const matchedProperties: RuleEvaluation["matchedProperties"] = [];

        properties.forEach((prop) => {
          const lastUpdate = new Date(prop.updated_at || prop.created_at || now);
          const daysInStage = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

          let matches = false;

          switch (rule.trigger.type) {
            case "stage_stall":
              if (prop.status === rule.trigger.stage && daysInStage >= (rule.trigger.days || 1)) {
                matches = true;
              }
              break;
            case "stage_entered":
              // Would need recent activity tracking - check if in stage and recent
              if (prop.status === rule.trigger.stage && daysInStage <= 1) {
                matches = true;
              }
              break;
            case "score_threshold":
              const score = prop.motivation_score || 0;
              if (rule.trigger.comparison === "above" && score >= (rule.trigger.scoreThreshold || 0)) {
                matches = true;
              } else if (rule.trigger.comparison === "below" && score <= (rule.trigger.scoreThreshold || 0)) {
                matches = true;
              }
              break;
            case "days_without_activity":
              if (daysInStage >= (rule.trigger.days || 7)) {
                matches = true;
              }
              break;
          }

          if (matches) {
            matchedProperties.push({
              id: prop.id,
              address: prop.address,
              daysInStage,
              score: prop.motivation_score || undefined,
            });
          }
        });

        return {
          rule,
          matchCount: matchedProperties.length,
          matchedProperties,
          wouldTrigger: matchedProperties.length > 0,
        };
      });
    },
    enabled: !!user?.id && rules.length > 0,
    staleTime: 60000,
    refetchInterval: 120000,
  });

  // Toggle rule active state
  const toggleRule = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const savedPrefs = localStorage.getItem(`auto-rules-prefs-${user?.id}`);
      const prefs: Record<string, boolean> = savedPrefs ? JSON.parse(savedPrefs) : {};
      prefs[ruleId] = isActive;
      localStorage.setItem(`auto-rules-prefs-${user?.id}`, JSON.stringify(prefs));
      return { ruleId, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-rules"] });
      toast.success("Rule updated");
    },
  });

  // Summary stats
  const activeRulesCount = rules.filter(r => r.isActive).length;
  const triggeredRulesCount = evaluations.filter(e => e.wouldTrigger).length;
  const totalMatchedProperties = evaluations.reduce((sum, e) => sum + e.matchCount, 0);

  return {
    rules,
    evaluations,
    isLoading,
    isEvaluating,
    toggleRule: toggleRule.mutate,
    activeRulesCount,
    triggeredRulesCount,
    totalMatchedProperties,
  };
}

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MovedDeal {
  id: string;
  address: string;
  fromStage: string;
  toStage: string;
  movedAt: string;
  direction: "forward" | "backward";
}

interface StalledDeal {
  id: string;
  address: string;
  stage: string;
  daysStalled: number;
  lastActivity: string;
  suggestedAction: string;
}

interface TomorrowPriority {
  id: string;
  address: string;
  reason: string;
  priority: "critical" | "high" | "medium";
  action: string;
}

export interface DailySummary {
  date: string;
  movedForward: MovedDeal[];
  movedBackward: MovedDeal[];
  stalled: StalledDeal[];
  tomorrowPriorities: TomorrowPriority[];
  stats: {
    totalDealsWorked: number;
    callsMade: number;
    offersSent: number;
    appointmentsSet: number;
    dealsWon: number;
    dealsLost: number;
  };
  highlights: string[];
  concerns: string[];
}

// Stage order for determining forward/backward movement
const STAGE_ORDER: Record<string, number> = {
  new: 1,
  contacted: 2,
  appointment: 3,
  offer_made: 4,
  follow_up: 5,
  negotiating: 6,
  under_contract: 7,
  marketing: 8,
  closed: 9,
  sold: 10,
};

// Suggested actions based on stage
const STAGE_ACTIONS: Record<string, string> = {
  new: "Make first contact",
  contacted: "Schedule appointment",
  appointment: "Present offer",
  offer_made: "Follow up on offer",
  follow_up: "Re-engage seller",
  negotiating: "Close the deal",
  under_contract: "Complete due diligence",
  marketing: "Find buyer",
};

export function useDailySummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["daily-summary", user?.id],
    queryFn: async (): Promise<DailySummary> => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

      // Fetch properties with recent activity
      const { data: properties, error } = await supabase
        .from("properties")
        .select(`
          id,
          address,
          status,
          motivation_score,
          updated_at,
          created_at
        `)
        .gte("updated_at", yesterdayStart.toISOString())
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch all active properties for stall detection
      const { data: allActive, error: activeError } = await supabase
        .from("properties")
        .select("id, address, status, motivation_score, updated_at")
        .not("status", "in", "(sold,closed)")
        .order("updated_at", { ascending: true })
        .limit(100);

      if (activeError) throw activeError;

      // Fetch activity log for today
      const { data: activityLog, error: activityError } = await supabase
        .from("activity_log")
        .select("action, entity_type, created_at")
        .gte("created_at", todayStart.toISOString())
        .limit(100);

      // Analyze movements (simplified - in production would track status changes)
      const movedForward: MovedDeal[] = [];
      const movedBackward: MovedDeal[] = [];

      // Detect stalled deals
      const stalled: StalledDeal[] = [];
      if (allActive) {
        allActive.forEach((prop) => {
          const lastUpdate = new Date(prop.updated_at || now);
          const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

          // Consider stalled if no activity for 5+ days
          if (daysSinceUpdate >= 5 && prop.status && !["sold", "closed"].includes(prop.status)) {
            stalled.push({
              id: prop.id,
              address: prop.address,
              stage: prop.status,
              daysStalled: daysSinceUpdate,
              lastActivity: prop.updated_at || "",
              suggestedAction: STAGE_ACTIONS[prop.status] || "Review and update",
            });
          }
        });
      }

      // Generate tomorrow's priorities
      const tomorrowPriorities: TomorrowPriority[] = [];
      
      // High motivation leads need immediate attention
      if (allActive) {
        allActive
          .filter(p => (p.motivation_score || 0) > 700)
          .slice(0, 3)
          .forEach((prop) => {
            tomorrowPriorities.push({
              id: prop.id,
              address: prop.address,
              reason: "High motivation seller",
              priority: (prop.motivation_score || 0) > 850 ? "critical" : "high",
              action: STAGE_ACTIONS[prop.status || "new"] || "Take action",
            });
          });
      }

      // Add stalled deals to priorities
      stalled.slice(0, 2).forEach((deal) => {
        tomorrowPriorities.push({
          id: deal.id,
          address: deal.address,
          reason: `Stalled ${deal.daysStalled} days`,
          priority: deal.daysStalled > 10 ? "critical" : "high",
          action: deal.suggestedAction,
        });
      });

      // Calculate stats from activity log
      const stats = {
        totalDealsWorked: properties?.length || 0,
        callsMade: activityLog?.filter(a => a.action === "call")?.length || 0,
        offersSent: activityLog?.filter(a => a.action === "offer_sent")?.length || 0,
        appointmentsSet: activityLog?.filter(a => a.action === "appointment_scheduled")?.length || 0,
        dealsWon: activityLog?.filter(a => a.action === "deal_won")?.length || 0,
        dealsLost: activityLog?.filter(a => a.action === "deal_lost")?.length || 0,
      };

      // Generate AI highlights
      const highlights: string[] = [];
      const concerns: string[] = [];

      if (stats.dealsWon > 0) {
        highlights.push(`🎉 ${stats.dealsWon} deal${stats.dealsWon > 1 ? "s" : ""} closed today!`);
      }
      if (movedForward.length > 0) {
        highlights.push(`📈 ${movedForward.length} deal${movedForward.length > 1 ? "s" : ""} moved forward`);
      }
      if (stats.appointmentsSet > 0) {
        highlights.push(`📅 ${stats.appointmentsSet} new appointment${stats.appointmentsSet > 1 ? "s" : ""} scheduled`);
      }
      if (properties && properties.length > 0 && highlights.length === 0) {
        highlights.push(`✨ ${properties.length} deal${properties.length > 1 ? "s" : ""} touched today`);
      }

      if (stalled.length > 5) {
        concerns.push(`⚠️ ${stalled.length} deals are stalling and need attention`);
      }
      if (stalled.some(d => d.daysStalled > 14)) {
        concerns.push(`🚨 Some deals have been inactive for 2+ weeks`);
      }
      if (stats.totalDealsWorked === 0 && !highlights.length) {
        concerns.push(`💤 No deal activity recorded today`);
      }

      return {
        date: todayStart.toISOString(),
        movedForward,
        movedBackward,
        stalled: stalled.slice(0, 5),
        tomorrowPriorities: tomorrowPriorities.slice(0, 5),
        stats,
        highlights,
        concerns,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

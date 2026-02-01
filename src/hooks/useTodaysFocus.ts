import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FocusDeal {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  status: string;
  motivation_score: number | null;
  profit_potential: number;
  urgency_level: "critical" | "high" | "medium";
  urgency_reason: string;
  days_in_stage: number;
  owner_phone: string | null;
  owner_email: string | null;
}

// Scoring weights for AI prioritization
const WEIGHTS = {
  profit: 0.35,        // 35% - Profit potential
  urgency: 0.30,       // 30% - Time sensitivity
  stageProximity: 0.20, // 20% - How close to closing
  motivation: 0.15,     // 15% - Seller motivation
};

// Stage proximity to close (higher = closer to closing)
const STAGE_PROXIMITY: Record<string, number> = {
  sold: 1.0,
  closed: 0.95,
  under_contract: 0.85,
  marketing: 0.80,
  negotiating: 0.70,
  offer_made: 0.55,
  follow_up: 0.50,
  appointment: 0.40,
  contacted: 0.25,
  new: 0.10,
};

export function useTodaysFocus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["todays-focus", user?.id],
    queryFn: async (): Promise<FocusDeal[]> => {
      // Fetch properties with relevant data
      const { data: properties, error } = await supabase
        .from("properties")
        .select(`
          id,
          address,
          city,
          state,
          status,
          motivation_score,
          arv,
          estimated_value,
          repair_estimate,
          equity_percent,
          mao_standard,
          owner_phone,
          owner_email,
          updated_at,
          created_at
        `)
        .not("status", "in", "(sold,closed)")
        .order("motivation_score", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!properties || properties.length === 0) return [];

      const now = new Date();

      // Calculate scores and rank deals
      const rankedDeals = properties.map((prop) => {
        // Calculate profit potential from ARV and repairs
        const arv = prop.arv || prop.estimated_value || 0;
        const repairs = prop.repair_estimate || 0;
        // Calculate equity from ARV-based estimate
        const equityFromPercent = prop.equity_percent ? (arv * prop.equity_percent / 100) : 0;
        const profitPotential = Math.max(equityFromPercent, arv * 0.25 - repairs, 0);

        // Calculate days in current stage
        const lastUpdate = new Date(prop.updated_at || prop.created_at || new Date());
        const daysInStage = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

        // Determine urgency level and reason
        let urgencyLevel: "critical" | "high" | "medium" = "medium";
        let urgencyReason = "";

        // Critical: stale deals, high motivation + early stage
        if (daysInStage > 7 && ["contacted", "appointment", "offer_made"].includes(prop.status)) {
          urgencyLevel = "critical";
          urgencyReason = `${daysInStage}d stalled`;
        } else if (prop.motivation_score && prop.motivation_score > 800) {
          urgencyLevel = "critical";
          urgencyReason = "Hot seller";
        } else if (daysInStage > 3 && ["new", "contacted"].includes(prop.status)) {
          urgencyLevel = "high";
          urgencyReason = "Needs follow-up";
        } else if (prop.status === "negotiating") {
          urgencyLevel = "high";
          urgencyReason = "Active negotiation";
        } else if (prop.equity_percent && prop.equity_percent > 40) {
          urgencyLevel = "high";
          urgencyReason = `${Math.round(prop.equity_percent)}% equity`;
        } else if (profitPotential > 50000) {
          urgencyLevel = "medium";
          urgencyReason = "High profit";
        } else {
          urgencyReason = STATUS_REASONS[prop.status] || "In pipeline";
        }

        // Calculate composite score
        const profitScore = Math.min(profitPotential / 100000, 1); // Normalize to 0-1
        const urgencyScore = urgencyLevel === "critical" ? 1 : urgencyLevel === "high" ? 0.7 : 0.4;
        const proximityScore = STAGE_PROXIMITY[prop.status] || 0.3;
        const motivationScore = Math.min((prop.motivation_score || 0) / 1000, 1);

        const compositeScore = 
          (profitScore * WEIGHTS.profit) +
          (urgencyScore * WEIGHTS.urgency) +
          (proximityScore * WEIGHTS.stageProximity) +
          (motivationScore * WEIGHTS.motivation);

        return {
          id: prop.id,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          status: prop.status,
          motivation_score: prop.motivation_score,
          profit_potential: profitPotential,
          urgency_level: urgencyLevel,
          urgency_reason: urgencyReason,
          days_in_stage: daysInStage,
          owner_phone: prop.owner_phone,
          owner_email: prop.owner_email,
          _score: compositeScore,
        };
      });

      // Sort by composite score and return top 3
      rankedDeals.sort((a, b) => b._score - a._score);
      
      return rankedDeals.slice(0, 3).map(({ _score, ...deal }) => deal);
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// Status-based default reasons
const STATUS_REASONS: Record<string, string> = {
  new: "New lead",
  contacted: "Contacted",
  appointment: "Appointment set",
  offer_made: "Offer pending",
  follow_up: "Follow-up needed",
  negotiating: "In negotiation",
  under_contract: "Under contract",
  marketing: "Marketing",
};

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NegotiationInput {
  property_address: string;
  arv: number;
  our_offer: number;
  seller_counter: number;
  walk_away_price?: number;
  repair_estimate?: number;
  comps?: any[];
  lead_type?: string;
  distress_signals?: string[];
  motivation_score?: number;
  mortgage_balance?: number;
}

export interface NegotiationAnalysis {
  recommendation: "accept" | "counter" | "decline";
  counter_amount: number | null;
  reasoning: string;
  talking_points: string[];
  draft_sms: string | null;
  draft_response: string | null;
  risk_level: "low" | "medium" | "high";
  profit_at_counter: number | null;
  creative_terms: string | null;
  next_steps: string[];
}

export function useNegotiationAI() {
  return useMutation({
    mutationFn: async (input: NegotiationInput): Promise<NegotiationAnalysis> => {
      const { data, error } = await supabase.functions.invoke("ai-negotiation", {
        body: input,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as NegotiationAnalysis;
    },
    onError: (error: Error) => {
      if (error.message?.includes("Rate limit")) {
        toast.error("AI rate limit reached. Try again in a moment.");
      } else if (error.message?.includes("credits")) {
        toast.error("AI credits exhausted. Please add funds.");
      } else {
        toast.error("AI analysis failed. Try again.");
      }
    },
  });
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BuyerIntelligence } from "@/components/ai/BuyerIntelligenceCard";

type InsightStep = "dealSetup" | "package" | "pricing" | "delivery" | "preview" | "review";

interface InsightContext {
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  arv?: number;
  askingPrice?: number;
  offerAmount?: number;
  offerPercentage?: number;
  flipperProfit?: number;
  wholesalerProfit?: number;
  selectedTemplate?: string;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
}

export function useOfferInsight(step: InsightStep, context: InsightContext, enabled: boolean = true) {
  const [insight, setInsight] = useState<string | null>(null);
  const [buyerIntelligence, setBuyerIntelligence] = useState<BuyerIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-offer-insights", {
        body: { step, context },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        setError(data.error);
      } else {
        setInsight(data?.insight || null);
        setBuyerIntelligence(data?.buyerIntelligence || null);
      }
    } catch (err) {
      console.error("Error fetching offer insight:", err);
      setError("Unable to generate insight. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [step, JSON.stringify(context), enabled]);

  useEffect(() => {
    if (enabled) {
      fetchInsight();
    }
  }, [step, enabled]);

  return {
    insight,
    buyerIntelligence,
    isLoading,
    error,
    refetch: fetchInsight,
  };
}

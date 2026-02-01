import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PipelineValueStats {
  leads: {
    count: number;
    totalValue: number;
    profitPotential: number;
  };
  offers: {
    count: number;
    totalValue: number;
    profitPotential: number;
  };
  contracted: {
    count: number;
    totalValue: number;
    profitPotential: number;
  };
  sold: {
    count: number;
    totalValue: number;
    profitPotential: number;
  };
}

export function usePipelineValueStats() {
  return useQuery({
    queryKey: ["pipeline-value-stats"],
    queryFn: async (): Promise<PipelineValueStats> => {
      // Fetch properties with financial data for each stage
      // Using columns that actually exist: arv, estimated_value, equity_percent, repair_estimate, mao_standard
      const [leadsResult, offersResult, contractedResult, soldResult] = await Promise.all([
        // Leads: new, contacted, appointment statuses (Discovery - Red)
        supabase
          .from("properties")
          .select("id, arv, estimated_value, equity_percent, repair_estimate, mao_standard")
          .in("status", ["new", "contacted", "appointment"]),
        
        // Offers: offer_made, negotiating, follow_up statuses (Intent - Yellow)
        supabase
          .from("properties")
          .select("id, arv, estimated_value, equity_percent, repair_estimate, mao_standard")
          .in("status", ["offer_made", "negotiating", "follow_up"]),
        
        // Contracted: under_contract, marketing statuses (Commitment - Blue)
        supabase
          .from("properties")
          .select("id, arv, estimated_value, equity_percent, repair_estimate, mao_standard")
          .in("status", ["under_contract", "marketing"]),
        
        // Sold: closed, sold statuses (Outcome - Green)
        supabase
          .from("properties")
          .select("id, arv, estimated_value, equity_percent, repair_estimate, mao_standard, last_sale_price")
          .in("status", ["closed", "sold"]),
      ]);

      const calculateStats = (properties: any[] | null) => {
        if (!properties || properties.length === 0) {
          return { count: 0, totalValue: 0, profitPotential: 0 };
        }

        const count = properties.length;
        
        // Total value = estimated_value or ARV as fallback
        const totalValue = properties.reduce((sum, p) => {
          return sum + (p.estimated_value || p.arv || 0);
        }, 0);
        
        // Profit potential = equity based on equity_percent, or estimate from ARV - estimated_value - repairs
        const profitPotential = properties.reduce((sum, p) => {
          // If we have equity_percent and ARV, calculate equity amount
          if (p.equity_percent && p.arv) {
            return sum + (p.arv * p.equity_percent / 100);
          }
          // Fallback: ARV - estimated value - repairs
          const arv = p.arv || 0;
          const currentValue = p.estimated_value || p.mao_standard || 0;
          const repairs = p.repair_estimate || 0;
          const estimatedProfit = arv - currentValue - repairs;
          return sum + Math.max(0, estimatedProfit);
        }, 0);

        return { count, totalValue, profitPotential };
      };

      // For sold properties, use last_sale_price as realized value
      const calculateSoldStats = (properties: any[] | null) => {
        if (!properties || properties.length === 0) {
          return { count: 0, totalValue: 0, profitPotential: 0 };
        }

        const count = properties.length;
        
        // Total value = sale price or estimated value
        const totalValue = properties.reduce((sum, p) => {
          return sum + (p.last_sale_price || p.estimated_value || p.arv || 0);
        }, 0);
        
        // For sold, profit = sale price - cost basis (estimated from mao_standard or calculated)
        const profitPotential = properties.reduce((sum, p) => {
          const salePrice = p.last_sale_price || p.arv || 0;
          // Estimate cost basis from MAO or a percentage of ARV
          const costBasis = p.mao_standard || (p.arv ? p.arv * 0.7 : 0);
          const repairs = p.repair_estimate || 0;
          return sum + Math.max(0, salePrice - costBasis - repairs);
        }, 0);

        return { count, totalValue, profitPotential };
      };

      return {
        leads: calculateStats(leadsResult.data),
        offers: calculateStats(offersResult.data),
        contracted: calculateStats(contractedResult.data),
        sold: calculateSoldStats(soldResult.data),
      };
    },
    refetchInterval: 30000,
  });
}

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
      // Using correct column names: estimated_value, arv, repair_estimate, equity_percent
      const [leadsResult, offersResult, contractedResult, soldResult] = await Promise.all([
        // Leads: new, contacted, appointment statuses
        supabase
          .from("properties")
          .select("id, estimated_value, arv, repair_estimate, equity_percent")
          .in("status", ["new", "contacted", "appointment"]),
        
        // Offers: offer_made, negotiating statuses
        supabase
          .from("properties")
          .select("id, estimated_value, arv, repair_estimate, equity_percent")
          .in("status", ["offer_made", "negotiating"]),
        
        // Contracted: under_contract status
        supabase
          .from("properties")
          .select("id, estimated_value, arv, repair_estimate, equity_percent")
          .eq("status", "under_contract"),
        
        // Sold: closed status
        supabase
          .from("properties")
          .select("id, estimated_value, arv, repair_estimate, equity_percent")
          .eq("status", "closed"),
      ]);

      const calculateStats = (properties: any[] | null) => {
        if (!properties || properties.length === 0) {
          return { count: 0, totalValue: 0, profitPotential: 0 };
        }

        const count = properties.length;
        const totalValue = properties.reduce((sum, p) => sum + (p.estimated_value || p.arv || 0), 0);
        
        // Profit potential = estimated based on ARV - estimated_value - repairs
        // Or calculate from equity_percent if available
        const profitPotential = properties.reduce((sum, p) => {
          const arv = p.arv || 0;
          const value = p.estimated_value || 0;
          const repairs = p.repair_estimate || 0;
          
          // If we have equity_percent, use that to estimate profit
          if (p.equity_percent && value > 0) {
            return sum + Math.max(0, value * (p.equity_percent / 100));
          }
          
          // Fallback calculation: ARV - current value - repairs
          if (arv > 0) {
            const estimatedProfit = arv - value - repairs;
            return sum + Math.max(0, estimatedProfit);
          }
          
          return sum;
        }, 0);

        return { count, totalValue, profitPotential };
      };

      // For sold properties, profit is realized
      const calculateSoldStats = (properties: any[] | null) => {
        if (!properties || properties.length === 0) {
          return { count: 0, totalValue: 0, profitPotential: 0 };
        }

        const count = properties.length;
        const totalValue = properties.reduce((sum, p) => sum + (p.arv || p.estimated_value || 0), 0);
        
        // For sold, calculate realized profit
        const profitPotential = properties.reduce((sum, p) => {
          const arv = p.arv || 0;
          const value = p.estimated_value || 0;
          const repairs = p.repair_estimate || 0;
          
          if (p.equity_percent && value > 0) {
            return sum + Math.max(0, value * (p.equity_percent / 100));
          }
          
          return sum + Math.max(0, arv - value - repairs);
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

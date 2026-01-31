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
      const [leadsResult, offersResult, contractedResult, soldResult] = await Promise.all([
        // Leads: new, contacted, appointment statuses
        supabase
          .from("properties")
          .select("id, asking_price, arv, repair_estimate, equity_amount")
          .in("status", ["new", "contacted", "appointment"]),
        
        // Offers: offer_made, negotiating statuses
        supabase
          .from("properties")
          .select("id, asking_price, arv, repair_estimate, equity_amount")
          .in("status", ["offer_made", "negotiating"]),
        
        // Contracted: under_contract status
        supabase
          .from("properties")
          .select("id, asking_price, arv, repair_estimate, equity_amount")
          .eq("status", "under_contract"),
        
        // Sold: closed status
        supabase
          .from("properties")
          .select("id, asking_price, arv, repair_estimate, equity_amount, sale_price")
          .eq("status", "closed"),
      ]);

      const calculateStats = (properties: any[] | null) => {
        if (!properties || properties.length === 0) {
          return { count: 0, totalValue: 0, profitPotential: 0 };
        }

        const count = properties.length;
        const totalValue = properties.reduce((sum, p) => sum + (p.asking_price || 0), 0);
        
        // Profit potential = sum of equity amounts, or estimate based on ARV - asking - repairs
        const profitPotential = properties.reduce((sum, p) => {
          if (p.equity_amount) {
            return sum + p.equity_amount;
          }
          // Fallback calculation
          const arv = p.arv || 0;
          const asking = p.asking_price || 0;
          const repairs = p.repair_estimate || 0;
          const estimatedProfit = arv - asking - repairs;
          return sum + Math.max(0, estimatedProfit);
        }, 0);

        return { count, totalValue, profitPotential };
      };

      // For sold properties, use actual sale_price - asking_price as realized profit
      const calculateSoldStats = (properties: any[] | null) => {
        if (!properties || properties.length === 0) {
          return { count: 0, totalValue: 0, profitPotential: 0 };
        }

        const count = properties.length;
        const totalValue = properties.reduce((sum, p) => sum + (p.sale_price || p.asking_price || 0), 0);
        
        // For sold, this is realized profit
        const profitPotential = properties.reduce((sum, p) => {
          const salePrice = p.sale_price || p.arv || 0;
          const costBasis = p.asking_price || 0;
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

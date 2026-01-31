import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export interface ActionInsight {
  type: "warning" | "action" | "opportunity";
  label: string;
  count?: number;
  severity?: "low" | "medium" | "high";
}

export interface StageBottleneck {
  status: string;
  label: string;
  count: number;
  isBottleneck: boolean;
  bottleneckReason?: string;
  avgDaysInStage?: number;
}

export interface HotOpportunityEnhanced {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  motivation_score: number | null;
  status: string | null;
  updated_at: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  // Enhanced "why it's hot" fields
  profit_potential: number | null;
  equity_percent: number | null;
  days_since_added: number;
  deal_score_rank: string; // "Top 5%", "Top 10%", "Top 20%"
  urgency_reason: string | null; // "High motivation", "High equity", etc.
  arv: number | null;
}

export interface DashboardInsights {
  // Action prompts for each tile
  leadsInsight: ActionInsight | null;
  offersInsight: ActionInsight | null;
  contractsInsight: ActionInsight | null;
  soldInsight: ActionInsight | null;
  
  // Bottleneck detection
  bottlenecks: StageBottleneck[];
  stallingCount: number;
  
  // Enhanced hot opportunities
  hotOpportunities: HotOpportunityEnhanced[];
}

export function useDashboardInsights() {
  return useQuery({
    queryKey: ["dashboard-insights"],
    queryFn: async (): Promise<DashboardInsights> => {
      const threeDaysAgo = subDays(new Date(), 3).toISOString();
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      
      // Parallel queries for insights
      const [
        newLeadsNeedingContact,
        pendingOffers,
        stallingDeals,
        hotProperties,
        stageDistribution,
      ] = await Promise.all([
        // New leads that need first contact (status = 'new', created > 3 days ago)
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "new")
          .lt("created_at", threeDaysAgo),
        
        // Offers awaiting response (pending offers)
        supabase
          .from("offers")
          .select("id", { count: "exact", head: true })
          .eq("response", "pending"),
        
        // Stalling deals (contacted status with no update in 7 days)
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "contacted")
          .lt("updated_at", sevenDaysAgo),
        
        // Hot properties with financial data (using existing columns)
        supabase
          .from("properties")
          .select("id, address, city, state, motivation_score, status, updated_at, created_at, owner_phone, owner_email, arv, estimated_value, repair_estimate, equity_percent, mao_standard")
          .order("motivation_score", { ascending: false })
          .limit(10),
        
        // Stage distribution for bottleneck detection
        Promise.all([
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "new"),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "contacted"),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "appointment"),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "offer_made"),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "under_contract"),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "closed"),
        ]),
      ]);

      // Calculate insights for each tile
      const leadsNeedingContact = newLeadsNeedingContact.count || 0;
      const pendingOffersCount = pendingOffers.count || 0;
      const stallingCount = stallingDeals.count || 0;
      
      const leadsInsight: ActionInsight | null = leadsNeedingContact > 0 
        ? { 
            type: "warning", 
            label: `${leadsNeedingContact} leads need first contact`,
            count: leadsNeedingContact,
            severity: leadsNeedingContact > 10 ? "high" : leadsNeedingContact > 5 ? "medium" : "low"
          }
        : null;

      const offersInsight: ActionInsight | null = pendingOffersCount > 0
        ? {
            type: "action",
            label: `${pendingOffersCount} offers awaiting response`,
            count: pendingOffersCount,
            severity: pendingOffersCount > 5 ? "high" : pendingOffersCount > 2 ? "medium" : "low"
          }
        : null;

      const contractsInsight: ActionInsight | null = null; // Could add "closing soon" count

      const soldInsight: ActionInsight | null = null; // Could add "closed this week" celebration

      // Bottleneck detection
      const stages = [
        { status: "new", label: "New Leads", count: stageDistribution[0].count || 0 },
        { status: "contacted", label: "Contacted", count: stageDistribution[1].count || 0 },
        { status: "appointment", label: "Appointments", count: stageDistribution[2].count || 0 },
        { status: "offer_made", label: "Offers Made", count: stageDistribution[3].count || 0 },
        { status: "under_contract", label: "Under Contract", count: stageDistribution[4].count || 0 },
        { status: "closed", label: "Closed", count: stageDistribution[5].count || 0 },
      ];

      const bottlenecks: StageBottleneck[] = stages.map((stage, index) => {
        const previousStage = index > 0 ? stages[index - 1] : null;
        
        // Detect bottlenecks
        let isBottleneck = false;
        let bottleneckReason: string | undefined;

        // If this stage has 0 and previous has many, that's a bottleneck
        if (stage.count === 0 && previousStage && previousStage.count > 3) {
          isBottleneck = true;
          bottleneckReason = `No deals progressing from ${previousStage.label}`;
        }

        return {
          ...stage,
          isBottleneck,
          bottleneckReason,
        };
      });

      // Enhance hot opportunities with "why it's hot" context
      const properties = hotProperties.data || [];
      
      const hotOpportunitiesEnhanced: HotOpportunityEnhanced[] = properties.map((prop, index) => {
        const daysSinceAdded = prop.created_at 
          ? Math.floor((Date.now() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        const arv = prop.arv || 0;
        const estimatedValue = prop.estimated_value || 0;
        const repairs = prop.repair_estimate || 0;
        const mao = prop.mao_standard || 0;
        
        // Calculate profit potential: ARV - MAO - repairs, or use equity
        const profitPotential = arv > 0 && mao > 0 
          ? arv - mao - repairs 
          : (prop.equity_percent ? (estimatedValue * prop.equity_percent / 100) : 0);
        
        // Calculate rank
        let dealScoreRank = "";
        if (index === 0) dealScoreRank = "🏆 Top Deal";
        else if (index < 2) dealScoreRank = "Top 5%";
        else if (index < 5) dealScoreRank = "Top 10%";
        else dealScoreRank = "Top 20%";
        
        // Determine urgency reason
        let urgencyReason: string | null = null;
        const score = prop.motivation_score || 0;
        const equity = prop.equity_percent || 0;
        
        if (score > 800) urgencyReason = "🔥 High motivation";
        else if (profitPotential > 50000) urgencyReason = `💰 ${formatCurrency(profitPotential)} profit`;
        else if (equity > 40) urgencyReason = `📈 ${Math.round(equity)}% equity`;
        else if (daysSinceAdded <= 1) urgencyReason = "⚡ Added today";
        else if (daysSinceAdded <= 3) urgencyReason = `⏰ Fresh lead (${daysSinceAdded}d)`;
        else if (score > 500) urgencyReason = "📊 Above avg score";
        
        return {
          id: prop.id,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          motivation_score: prop.motivation_score,
          status: prop.status,
          updated_at: prop.updated_at,
          owner_phone: prop.owner_phone,
          owner_email: prop.owner_email,
          profit_potential: profitPotential > 0 ? profitPotential : null,
          equity_percent: prop.equity_percent,
          days_since_added: daysSinceAdded,
          deal_score_rank: dealScoreRank,
          urgency_reason: urgencyReason,
          arv: arv > 0 ? arv : null,
        };
      });

      return {
        leadsInsight,
        offersInsight,
        contractsInsight,
        soldInsight,
        bottlenecks,
        stallingCount,
        hotOpportunities: hotOpportunitiesEnhanced,
      };
    },
    refetchInterval: 30000,
  });
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString()}`;
}

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DealAnalysis {
  id: string;
  user_id: string;
  organization_id?: string;
  property_id?: string;
  name: string;
  analysis_type: "flip" | "wholesale" | "rental" | "brrrr" | "creative";
  status: "draft" | "active" | "archived";
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  year_built?: number;
  asking_price?: number;
  purchase_price?: number;
  purchase_closing_costs?: number;
  arv?: number;
  repair_estimate?: number;
  repair_contingency_pct?: number;
  holding_months?: number;
  property_taxes_monthly?: number;
  insurance_monthly?: number;
  utilities_monthly?: number;
  hoa_monthly?: number;
  loan_payment_monthly?: number;
  other_holding_monthly?: number;
  financing_type?: string;
  loan_amount?: number;
  interest_rate?: number;
  loan_points?: number;
  loan_origination_fee?: number;
  down_payment_pct?: number;
  agent_commission_pct?: number;
  seller_closing_costs_pct?: number;
  staging_costs?: number;
  photography_costs?: number;
  total_purchase_cost?: number;
  total_repair_cost?: number;
  total_holding_cost?: number;
  total_financing_cost?: number;
  total_selling_cost?: number;
  total_project_cost?: number;
  gross_profit?: number;
  net_profit?: number;
  roi_percentage?: number;
  annualized_roi?: number;
  profit_per_month?: number;
  mao_70_pct?: number;
  mao_75_pct?: number;
  mao_80_pct?: number;
  created_at: string;
  updated_at: string;
}

interface FetchFilters {
  type?: DealAnalysis["analysis_type"];
  status?: DealAnalysis["status"];
  property_id?: string;
}

export function useDealAnalyses() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = React.useState<DealAnalysis[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchAnalyses = React.useCallback(async (filters?: FetchFilters) => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from("deal_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.type) query = query.eq("analysis_type", filters.type);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.property_id) query = query.eq("property_id", filters.property_id);

      const { data, error } = await query;
      if (error) throw error;
      setAnalyses((data as DealAnalysis[]) || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAnalysis = async (input: Partial<DealAnalysis> & { address: string; name: string }) => {
    if (!user) throw new Error("User not authenticated");

    const insertData = {
      ...input,
      user_id: user.id,
      purchase_price: input.purchase_price ?? input.asking_price ?? 0,
    };

    const { data, error } = await supabase
      .from("deal_analyses")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create analysis");
      throw error;
    }

    toast.success("Analysis created");
    return data as DealAnalysis;
  };

  const updateAnalysis = async (id: string, input: Partial<DealAnalysis>) => {
    const calculated = calculateDealMetrics(input);

    const { error } = await supabase
      .from("deal_analyses")
      .update({
        ...input,
        ...calculated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to save analysis");
      throw error;
    }

    toast.success("Saved");
    fetchAnalyses();
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("deal_analyses").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete analysis");
      throw error;
    }

    toast.success("Analysis deleted");
    fetchAnalyses();
  };

  const getAnalysis = async (id: string): Promise<DealAnalysis | null> => {
    const { data, error } = await supabase
      .from("deal_analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching analysis:", error);
      return null;
    }

    return data as DealAnalysis;
  };

  return {
    analyses,
    loading,
    fetchAnalyses,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    getAnalysis,
  };
}

// Calculate all deal metrics
export function calculateDealMetrics(data: Partial<DealAnalysis>) {
  const {
    purchase_price = 0,
    purchase_closing_costs = 0,
    repair_estimate = 0,
    repair_contingency_pct = 10,
    holding_months = 6,
    property_taxes_monthly = 0,
    insurance_monthly = 0,
    utilities_monthly = 0,
    hoa_monthly = 0,
    loan_payment_monthly = 0,
    other_holding_monthly = 0,
    arv = 0,
    agent_commission_pct = 5,
    seller_closing_costs_pct = 1.5,
    staging_costs = 0,
    photography_costs = 0,
    financing_type = "cash",
    loan_amount = 0,
    interest_rate = 0,
    loan_points = 0,
    loan_origination_fee = 0,
    down_payment_pct = 100,
  } = data;

  const total_repair_cost = repair_estimate * (1 + repair_contingency_pct / 100);

  const monthly_holding =
    property_taxes_monthly +
    insurance_monthly +
    utilities_monthly +
    hoa_monthly +
    loan_payment_monthly +
    other_holding_monthly;
  const total_holding_cost = monthly_holding * holding_months;

  const points_cost = (loan_amount * loan_points) / 100;
  const interest_cost =
    financing_type !== "cash"
      ? (loan_amount * (interest_rate / 100) * holding_months) / 12
      : 0;
  const total_financing_cost = points_cost + loan_origination_fee + interest_cost;

  const commission = (arv * agent_commission_pct) / 100;
  const closing = (arv * seller_closing_costs_pct) / 100;
  const total_selling_cost = commission + closing + staging_costs + photography_costs;

  const total_purchase_cost = purchase_price + purchase_closing_costs;
  const total_project_cost =
    total_purchase_cost +
    total_repair_cost +
    total_holding_cost +
    total_financing_cost +
    total_selling_cost;

  const gross_profit = arv - purchase_price - total_repair_cost;
  const net_profit = arv - total_project_cost;

  const down_payment_amount = (purchase_price * down_payment_pct) / 100;
  const cash_required = down_payment_amount + purchase_closing_costs + total_repair_cost;

  const roi_percentage = cash_required > 0 ? (net_profit / cash_required) * 100 : 0;
  const annualized_roi = holding_months > 0 ? roi_percentage * (12 / holding_months) : 0;
  const profit_per_month = holding_months > 0 ? net_profit / holding_months : 0;

  const mao_70_pct = arv * 0.7 - total_repair_cost;
  const mao_75_pct = arv * 0.75 - total_repair_cost;
  const mao_80_pct = arv * 0.8 - total_repair_cost;

  return {
    total_purchase_cost: Math.round(total_purchase_cost),
    total_repair_cost: Math.round(total_repair_cost),
    total_holding_cost: Math.round(total_holding_cost),
    total_financing_cost: Math.round(total_financing_cost),
    total_selling_cost: Math.round(total_selling_cost),
    total_project_cost: Math.round(total_project_cost),
    gross_profit: Math.round(gross_profit),
    net_profit: Math.round(net_profit),
    roi_percentage: Math.round(roi_percentage * 100) / 100,
    annualized_roi: Math.round(annualized_roi * 100) / 100,
    profit_per_month: Math.round(profit_per_month),
    mao_70_pct: Math.round(mao_70_pct),
    mao_75_pct: Math.round(mao_75_pct),
    mao_80_pct: Math.round(mao_80_pct),
  };
}

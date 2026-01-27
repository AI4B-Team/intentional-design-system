import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LendingCriteria {
  min_loan_amount?: number;
  max_loan_amount?: number;
  interest_rate_range?: { min: number; max: number };
  preferred_term_months?: number[];
  max_ltv?: number;
  property_types?: string[];
  geographic_areas?: string[];
  loan_types?: string[];
}

export interface LenderLoan {
  id: string;
  lender_id: string;
  property_id: string;
  user_id: string;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
  points: number;
  ltv_at_funding: number | null;
  funding_date: string;
  maturity_date: string;
  status: string;
  total_payments_made: number;
  total_interest_paid: number;
  payoff_date: string | null;
  payoff_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    arv: number | null;
  };
}

export interface LenderLoanInsert {
  lender_id: string;
  property_id: string;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
  points?: number;
  ltv_at_funding?: number;
  funding_date: string;
  maturity_date: string;
  notes?: string;
}

export function useLenderLoans(lenderId: string | undefined, status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lender-loans", lenderId, status],
    queryFn: async () => {
      if (!lenderId || !user?.id) return [];

      let query = supabase
        .from("lender_loans")
        .select(`
          *,
          property:properties(id, address, city, state, arv)
        `)
        .eq("lender_id", lenderId)
        .eq("user_id", user.id);

      if (status) {
        query = query.eq("status", status);
      }

      query = query.order("funding_date", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as LenderLoan[];
    },
    enabled: !!lenderId && !!user?.id,
  });
}

export function useLenderLoanStats(lenderId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lender-loan-stats", lenderId],
    queryFn: async () => {
      if (!lenderId || !user?.id) return null;

      const { data, error } = await supabase
        .from("lender_loans")
        .select("loan_amount, interest_rate, ltv_at_funding, status, total_interest_paid")
        .eq("lender_id", lenderId)
        .eq("user_id", user.id);

      if (error) throw error;

      const activeLoans = data.filter((l) => l.status === "active");
      const totalCapitalDeployed = activeLoans.reduce((sum, l) => sum + Number(l.loan_amount), 0);
      const avgInterestRate =
        activeLoans.length > 0
          ? activeLoans.reduce((sum, l) => sum + Number(l.interest_rate), 0) / activeLoans.length
          : 0;
      
      // Weighted average LTV
      const totalLoanForLtv = activeLoans.filter(l => l.ltv_at_funding).reduce((sum, l) => sum + Number(l.loan_amount), 0);
      const weightedLtv =
        totalLoanForLtv > 0
          ? activeLoans.filter(l => l.ltv_at_funding).reduce((sum, l) => sum + (Number(l.ltv_at_funding) * Number(l.loan_amount)), 0) / totalLoanForLtv
          : 0;

      const lifetimeStats = {
        totalLoans: data.length,
        totalInterestEarned: data.reduce((sum, l) => sum + Number(l.total_interest_paid), 0),
        avgLoanSize: data.length > 0 ? data.reduce((sum, l) => sum + Number(l.loan_amount), 0) / data.length : 0,
      };

      return {
        totalCapitalDeployed,
        activeLoansCount: activeLoans.length,
        avgInterestRate,
        weightedAvgLtv: weightedLtv,
        ...lifetimeStats,
      };
    },
    enabled: !!lenderId && !!user?.id,
  });
}

export function useCreateLenderLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: LenderLoanInsert) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("lender_loans")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lender-loans", data.lender_id] });
      queryClient.invalidateQueries({ queryKey: ["lender-loan-stats", data.lender_id] });
      toast.success("Loan recorded successfully");
    },
    onError: (error) => {
      console.error("Error creating loan:", error);
      toast.error("Failed to record loan");
    },
  });
}

export function useUpdateLenderLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LenderLoan> }) => {
      const { data, error } = await supabase
        .from("lender_loans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lender-loans", data.lender_id] });
      queryClient.invalidateQueries({ queryKey: ["lender-loan-stats", data.lender_id] });
      toast.success("Loan updated");
    },
    onError: (error) => {
      console.error("Error updating loan:", error);
      toast.error("Failed to update loan");
    },
  });
}

export function useUpdateLendingCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, criteria }: { id: string; criteria: LendingCriteria }) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update({ lending_criteria: criteria as never })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deal-source", data.id] });
      toast.success("Lending criteria updated");
    },
    onError: (error) => {
      console.error("Error updating lending criteria:", error);
      toast.error("Failed to update lending criteria");
    },
  });
}

export function useUserProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-properties-simple", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, arv")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

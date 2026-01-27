import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MarketplaceLender {
  id: string;
  name: string;
  company: string | null;
  logo_url: string | null;
  lender_type: string;
  min_loan_amount: number | null;
  max_loan_amount: number | null;
  rate_range_min: number | null;
  rate_range_max: number | null;
  points_range_min: number | null;
  points_range_max: number | null;
  max_ltv: number | null;
  max_arv_ltv: number | null;
  min_credit_score: number | null;
  property_types: string[];
  states_served: string[];
  loan_purposes: string[];
  typical_funding_days: number | null;
  prepayment_penalty: boolean;
  description: string | null;
  application_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FundingRequest {
  id: string;
  user_id: string;
  property_id: string | null;
  request_type: string;
  loan_amount_requested: number | null;
  purpose: string | null;
  property_value: number | null;
  arv: number | null;
  purchase_price: number | null;
  rehab_budget: number | null;
  exit_strategy: string | null;
  timeline_needed: string | null;
  credit_score_range: string | null;
  experience_level: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundingSubmission {
  id: string;
  funding_request_id: string;
  lender_id: string;
  submitted_at: string;
  status: string;
  response_at: string | null;
  offered_amount: number | null;
  offered_rate: number | null;
  offered_points: number | null;
  offered_term: number | null;
  conditions: string | null;
  expiration_date: string | null;
  selected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lender?: MarketplaceLender;
}

// Fetch active marketplace lenders
export function useMarketplaceLenders(filters?: {
  lenderType?: string;
  minLoan?: number;
  maxLoan?: number;
  state?: string;
}) {
  return useQuery({
    queryKey: ["marketplace-lenders", filters],
    queryFn: async () => {
      let query = supabase
        .from("marketplace_lenders")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (filters?.lenderType) {
        query = query.eq("lender_type", filters.lenderType);
      }
      if (filters?.minLoan) {
        query = query.gte("max_loan_amount", filters.minLoan);
      }
      if (filters?.maxLoan) {
        query = query.lte("min_loan_amount", filters.maxLoan);
      }
      if (filters?.state) {
        query = query.or(`states_served.cs.{${filters.state}},states_served.cs.{nationwide}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketplaceLender[];
    },
  });
}

// Fetch user's funding requests
export function useFundingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["funding-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("funding_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FundingRequest[];
    },
    enabled: !!user,
  });
}

// Fetch single funding request
export function useFundingRequest(id: string | undefined) {
  return useQuery({
    queryKey: ["funding-request", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("funding_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as FundingRequest;
    },
    enabled: !!id,
  });
}

// Fetch submissions for a funding request
export function useFundingSubmissions(requestId: string | undefined) {
  return useQuery({
    queryKey: ["funding-submissions", requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await supabase
        .from("funding_submissions")
        .select(`
          *,
          lender:marketplace_lenders(*)
        `)
        .eq("funding_request_id", requestId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as (FundingSubmission & { lender: MarketplaceLender })[];
    },
    enabled: !!requestId,
  });
}

// Create funding request
export function useCreateFundingRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: Omit<FundingRequest, "id" | "user_id" | "created_at" | "updated_at" | "status">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("funding_requests")
        .insert({ ...request, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-requests"] });
      toast.success("Funding request created");
    },
    onError: (error) => {
      console.error("Error creating funding request:", error);
      toast.error("Failed to create funding request");
    },
  });
}

// Update funding request
export function useUpdateFundingRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FundingRequest> }) => {
      const { data, error } = await supabase
        .from("funding_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["funding-requests"] });
      queryClient.invalidateQueries({ queryKey: ["funding-request", data.id] });
      toast.success("Funding request updated");
    },
    onError: (error) => {
      console.error("Error updating funding request:", error);
      toast.error("Failed to update funding request");
    },
  });
}

// Submit request to lenders
export function useSubmitToLenders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, lenderIds }: { requestId: string; lenderIds: string[] }) => {
      const submissions = lenderIds.map((lenderId) => ({
        funding_request_id: requestId,
        lender_id: lenderId,
        status: "submitted",
      }));

      const { data, error } = await supabase
        .from("funding_submissions")
        .insert(submissions)
        .select();

      if (error) throw error;

      // Update request status to submitted
      await supabase
        .from("funding_requests")
        .update({ status: "submitted" })
        .eq("id", requestId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funding-requests"] });
      queryClient.invalidateQueries({ queryKey: ["funding-request", variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ["funding-submissions", variables.requestId] });
      toast.success(`Submitted to ${variables.lenderIds.length} lenders`);
    },
    onError: (error) => {
      console.error("Error submitting to lenders:", error);
      toast.error("Failed to submit to lenders");
    },
  });
}

// Capital stats
export function useCapitalStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["capital-stats", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, pending: 0, approved: 0, funded: 0 };

      const { data: requests, error } = await supabase
        .from("funding_requests")
        .select("status, loan_amount_requested")
        .eq("user_id", user.id);

      if (error) throw error;

      return {
        total: requests.length,
        pending: requests.filter((r) => ["submitted", "reviewing"].includes(r.status)).length,
        approved: requests.filter((r) => r.status === "approved").length,
        funded: requests.filter((r) => r.status === "funded").length,
        totalRequested: requests.reduce((sum, r) => sum + (r.loan_amount_requested || 0), 0),
      };
    },
    enabled: !!user,
  });
}

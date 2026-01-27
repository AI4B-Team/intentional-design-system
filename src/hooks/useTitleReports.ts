import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Mortgage {
  lender: string;
  original_amount: number;
  recording_date: string;
  estimated_balance: number;
  position: "first" | "second" | "third";
}

export interface Lien {
  type: "tax" | "mechanic" | "hoa" | "judgment" | "federal" | "state" | "other";
  creditor: string;
  amount: number;
  recording_date: string;
  status: "active" | "released";
}

export interface Judgment {
  plaintiff: string;
  amount: number;
  case_number: string;
  date: string;
}

export interface TaxStatus {
  current_year_paid: boolean;
  delinquent_amount: number;
  delinquent_years: number[];
}

export interface HoaStatus {
  has_hoa: boolean;
  current: boolean;
  delinquent_amount: number;
}

export interface TitleReportSummary {
  title_status: "clear" | "issues_found" | "major_issues";
  owner_of_record: string;
  vesting_type: string;
  legal_description: string;
  mortgages: Mortgage[];
  liens: Lien[];
  judgments: Judgment[];
  tax_status: TaxStatus;
  hoa_status: HoaStatus;
  total_liens_amount: number;
  estimated_equity: number;
  flags: string[];
}

export interface TitleReport {
  id: string;
  property_id: string;
  user_id: string;
  report_type: "preliminary" | "full" | "update";
  ordered_at: string | null;
  received_at: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  provider: string;
  cost: number | null;
  report_url: string | null;
  summary: TitleReportSummary | null;
  created_at: string;
  updated_at: string;
}

// Helper to create default summary
export function createDefaultSummary(): TitleReportSummary {
  return {
    title_status: "clear",
    owner_of_record: "",
    vesting_type: "",
    legal_description: "",
    mortgages: [],
    liens: [],
    judgments: [],
    tax_status: {
      current_year_paid: true,
      delinquent_amount: 0,
      delinquent_years: [],
    },
    hoa_status: {
      has_hoa: false,
      current: true,
      delinquent_amount: 0,
    },
    total_liens_amount: 0,
    estimated_equity: 0,
    flags: [],
  };
}

// Fetch title report for a property
export function usePropertyTitleReport(propertyId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["title-report", propertyId],
    queryFn: async () => {
      if (!propertyId || !user?.id) return null;

      const { data, error } = await supabase
        .from("title_reports")
        .select("*")
        .eq("property_id", propertyId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        summary: data.summary as unknown as TitleReportSummary | null,
      } as TitleReport;
    },
    enabled: !!propertyId && !!user?.id,
  });
}

// Fetch all title reports for user
export function useTitleReports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["title-reports"],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("title_reports")
        .select(`
          *,
          property:properties(id, address, city, state)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Create title report
export function useCreateTitleReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      property_id: string;
      report_type?: string;
      provider?: string;
      summary?: TitleReportSummary;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const insertData = {
        property_id: data.property_id,
        user_id: user.id,
        report_type: data.report_type || "preliminary",
        provider: data.provider || "manual",
        status: data.provider === "manual" ? "completed" : "pending",
        ordered_at: new Date().toISOString(),
        received_at: data.provider === "manual" ? new Date().toISOString() : null,
        summary: JSON.parse(JSON.stringify(data.summary || createDefaultSummary())),
      };

      const { data: result, error } = await supabase
        .from("title_reports")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return {
        ...result,
        summary: result.summary as unknown as TitleReportSummary | null,
      } as TitleReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["title-report", data.property_id] });
      queryClient.invalidateQueries({ queryKey: ["title-reports"] });
      toast.success("Title report created");
    },
    onError: (error) => {
      console.error("Error creating title report:", error);
      toast.error("Failed to create title report");
    },
  });
}

// Update title report
export function useUpdateTitleReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        report_type: string;
        status: string;
        provider: string;
        cost: number;
        report_url: string;
        summary: TitleReportSummary;
        received_at: string;
      }>;
    }) => {
      // Convert summary to JSON-compatible format
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.summary) {
        dbUpdates.summary = JSON.parse(JSON.stringify(updates.summary));
      }
      
      const { data, error } = await supabase
        .from("title_reports")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        summary: data.summary as unknown as TitleReportSummary | null,
      } as TitleReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["title-report", data.property_id] });
      queryClient.invalidateQueries({ queryKey: ["title-reports"] });
      toast.success("Title report updated");
    },
    onError: (error) => {
      console.error("Error updating title report:", error);
      toast.error("Failed to update title report");
    },
  });
}

// Delete title report
export function useDeleteTitleReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("title_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["title-reports"] });
      toast.success("Title report deleted");
    },
    onError: (error) => {
      console.error("Error deleting title report:", error);
      toast.error("Failed to delete title report");
    },
  });
}

// Calculate title metrics
export function calculateTitleMetrics(summary: TitleReportSummary | null, propertyValue: number | null) {
  if (!summary) {
    return {
      totalMortgageDebt: 0,
      totalLiens: 0,
      totalJudgments: 0,
      costToClear: 0,
      estimatedEquity: 0,
      netToSeller: 0,
    };
  }

  const totalMortgageDebt = summary.mortgages.reduce((sum, m) => sum + (m.estimated_balance || 0), 0);
  const totalLiens = summary.liens
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalJudgments = summary.judgments.reduce((sum, j) => sum + (j.amount || 0), 0);
  const taxDelinquent = summary.tax_status?.delinquent_amount || 0;
  const hoaDelinquent = summary.hoa_status?.delinquent_amount || 0;

  const costToClear = totalLiens + totalJudgments + taxDelinquent + hoaDelinquent;
  const value = propertyValue || 0;
  const estimatedEquity = value - totalMortgageDebt - costToClear;
  const netToSeller = value - totalMortgageDebt - costToClear;

  return {
    totalMortgageDebt,
    totalLiens,
    totalJudgments,
    costToClear,
    estimatedEquity,
    netToSeller,
  };
}

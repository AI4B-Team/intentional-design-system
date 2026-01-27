import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import {
  checkCompliance,
  type StateRegulation,
  type ComplianceResult,
  type DealType,
  type DealTerms,
} from "@/lib/compliance";

// ============ STATE REGULATIONS ============

export function useStateRegulations() {
  return useQuery({
    queryKey: ["state-regulations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_regulations")
        .select("*")
        .order("state_name");
      if (error) throw error;
      return data as StateRegulation[];
    },
  });
}

export function useStateRegulation(stateCode: string | undefined) {
  return useQuery({
    queryKey: ["state-regulation", stateCode],
    queryFn: async () => {
      if (!stateCode) return null;
      const { data, error } = await supabase
        .from("state_regulations")
        .select("*")
        .eq("state_code", stateCode.toUpperCase())
        .single();
      if (error) {
        if (error.code === "PGRST116") return null; // No rows found
        throw error;
      }
      return data as StateRegulation;
    },
    enabled: !!stateCode,
  });
}

// ============ COMPLIANCE CHECKS ============

export function useComplianceChecks(propertyId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compliance-checks", propertyId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("compliance_checks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSaveComplianceCheck() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      propertyId,
      checkType,
      state,
      dealTerms,
      result,
    }: {
      propertyId?: string;
      checkType: DealType;
      state: string;
      dealTerms: DealTerms;
      result: ComplianceResult;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("compliance_checks")
        .insert([{
          user_id: user.id,
          check_type: checkType,
          state,
          deal_terms: JSON.parse(JSON.stringify(dealTerms)) as Json,
          passed: result.passed,
          warnings: result.warnings.map(w => w.message),
          errors: result.errors.map(e => e.message),
          required_disclosures: result.required_disclosures,
          property_id: propertyId || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-checks", variables.propertyId] });
      toast.success("Compliance check saved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============ COMPLIANCE CHECK HOOK ============

export function useRunComplianceCheck() {
  const { data: regulations } = useStateRegulations();

  const runCheck = (
    stateCode: string,
    dealType: DealType,
    terms: DealTerms
  ): ComplianceResult | null => {
    if (!regulations) return null;
    
    const regulation = regulations.find(
      r => r.state_code.toUpperCase() === stateCode.toUpperCase()
    );
    
    if (!regulation) {
      return {
        passed: true,
        warnings: [{
          code: "NO_STATE_DATA",
          message: `No specific regulations found for ${stateCode}. Please verify compliance manually.`,
          severity: "medium",
        }],
        errors: [],
        required_disclosures: [
          "Property condition disclosure",
          "Lead-based paint disclosure (pre-1978)",
        ],
        recommendations: ["Consult with a local real estate attorney for state-specific requirements."],
        state_info: {
          usury_limit: null,
          foreclosure_type: null,
          redemption_period: null,
        },
      };
    }
    
    return checkCompliance(regulation, dealType, terms);
  };

  return { runCheck, isLoading: !regulations };
}

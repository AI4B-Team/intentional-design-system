import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface RentComp {
  id: string;
  property_id: string;
  comp_address: string;
  rent_amount: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  distance_miles: number | null;
  source: string;
  listed_date: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

export interface PortfolioProperty {
  id: string;
  user_id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  monthly_rent: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentAnalysis {
  rentRange: { min: number; max: number };
  recommendedRent: number;
  avgPerSqFt: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  compCount: number;
}

// ============ RENT COMPS ============

export function useRentComps(propertyId: string) {
  return useQuery({
    queryKey: ["rent-comps", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rent_comps")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RentComp[];
    },
    enabled: !!propertyId,
  });
}

export function useCreateRentComp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<RentComp, "id" | "created_at" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data: result, error } = await supabase
        .from("rent_comps")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rent-comps", variables.property_id] });
      toast.success("Rent comp added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRentComp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { error } = await supabase.from("rent_comps").delete().eq("id", id);
      if (error) throw error;
      return propertyId;
    },
    onSuccess: (propertyId) => {
      queryClient.invalidateQueries({ queryKey: ["rent-comps", propertyId] });
      toast.success("Rent comp deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============ PORTFOLIO PROPERTIES ============

export function usePortfolioProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["portfolio-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("portfolio_properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PortfolioProperty[];
    },
    enabled: !!user,
  });
}

export function useCreatePortfolioProperty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<PortfolioProperty, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data: result, error } = await supabase
        .from("portfolio_properties")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-properties"] });
      toast.success("Portfolio property added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePortfolioProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<PortfolioProperty> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("portfolio_properties")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-properties"] });
      toast.success("Portfolio property updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePortfolioProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-properties"] });
      toast.success("Portfolio property deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============ RENT ANALYSIS ============

export function calculateRentAnalysis(comps: RentComp[], subjectSqft: number | null): RentAnalysis | null {
  const validComps = comps.filter((c) => c.rent_amount && c.rent_amount > 0);
  
  if (validComps.length === 0) return null;

  const rents = validComps.map((c) => c.rent_amount!);
  const minRent = Math.min(...rents);
  const maxRent = Math.max(...rents);

  // Weighted average: closer comps and more recent get higher weight
  let weightedSum = 0;
  let totalWeight = 0;

  validComps.forEach((comp) => {
    let weight = 1;
    
    // Distance weight: closer = higher weight
    if (comp.distance_miles) {
      weight *= Math.max(0.5, 1 - comp.distance_miles * 0.1);
    }
    
    // Source weight: portfolio and recently rented are more reliable
    if (comp.source === "user_portfolio" || comp.status === "rented") {
      weight *= 1.2;
    }

    weightedSum += comp.rent_amount! * weight;
    totalWeight += weight;
  });

  const recommendedRent = Math.round(weightedSum / totalWeight);

  // Calculate avg $/sqft
  const compsWithSqft = validComps.filter((c) => c.sqft && c.sqft > 0);
  const avgPerSqFt = compsWithSqft.length > 0
    ? compsWithSqft.reduce((sum, c) => sum + c.rent_amount! / c.sqft!, 0) / compsWithSqft.length
    : 0;

  // Confidence based on comp count and variance
  const variance = maxRent - minRent;
  const avgRent = rents.reduce((a, b) => a + b, 0) / rents.length;
  const variancePercent = variance / avgRent;

  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (validComps.length >= 5 && variancePercent < 0.15) {
    confidence = "HIGH";
  } else if (validComps.length >= 3 && variancePercent < 0.25) {
    confidence = "MEDIUM";
  }

  return {
    rentRange: { min: minRent, max: maxRent },
    recommendedRent,
    avgPerSqFt: Math.round(avgPerSqFt * 100) / 100,
    confidence,
    compCount: validComps.length,
  };
}

// Quick rent estimate using 1% rule
export function calculateQuickRentEstimate(propertyValue: number): number {
  return Math.round(propertyValue * 0.01);
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface JVProfile {
  id: string;
  user_id: string;
  profile_type: string;
  available_capital: number | null;
  target_deal_types: string[];
  target_areas: string[];
  preferred_role: string;
  experience_level: string;
  deals_completed: number;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface JVOpportunity {
  id: string;
  user_id: string;
  property_id: string | null;
  title: string;
  description: string | null;
  capital_needed: number | null;
  your_contribution: string | null;
  seeking: string | null;
  proposed_split: string | null;
  deal_type: string | null;
  location: string | null;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  property?: {
    address: string;
    city: string;
    state: string;
  };
}

export interface JVInquiry {
  id: string;
  opportunity_id: string;
  inquirer_user_id: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  opportunity?: JVOpportunity;
}

interface JVProfileFilters {
  profileType?: string;
  minCapital?: number;
  maxCapital?: number;
  dealTypes?: string[];
  areas?: string[];
}

interface JVOpportunityFilters {
  minCapital?: number;
  maxCapital?: number;
  dealType?: string;
  location?: string;
  status?: string;
}

// ============ JV PROFILES ============

export function useJVProfiles(filters?: JVProfileFilters) {
  return useQuery({
    queryKey: ["jv-profiles", filters],
    queryFn: async () => {
      let query = supabase
        .from("jv_profiles")
        .select("*")
        .eq("is_public", true);

      if (filters?.profileType && filters.profileType !== "all") {
        query = query.eq("profile_type", filters.profileType);
      }
      if (filters?.minCapital) {
        query = query.gte("available_capital", filters.minCapital);
      }
      if (filters?.maxCapital) {
        query = query.lte("available_capital", filters.maxCapital);
      }
      if (filters?.dealTypes?.length) {
        query = query.overlaps("target_deal_types", filters.dealTypes);
      }
      if (filters?.areas?.length) {
        query = query.overlaps("target_areas", filters.areas);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as JVProfile[];
    },
  });
}

export function useMyJVProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["jv-profile", "mine"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("jv_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as JVProfile | null;
    },
    enabled: !!user,
  });
}

export function useCreateJVProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<JVProfile>) => {
      if (!user) throw new Error("Not authenticated");
      const { data: result, error } = await supabase
        .from("jv_profiles")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jv-profile"] });
      queryClient.invalidateQueries({ queryKey: ["jv-profiles"] });
      toast.success("JV profile created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateJVProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<JVProfile> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("jv_profiles")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jv-profile"] });
      queryClient.invalidateQueries({ queryKey: ["jv-profiles"] });
      toast.success("JV profile updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============ JV OPPORTUNITIES ============

export function useJVOpportunities(filters?: JVOpportunityFilters, myOnly = false) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["jv-opportunities", filters, myOnly, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("jv_opportunities")
        .select(`
          *,
          property:properties(address, city, state)
        `);

      if (myOnly && user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("visibility", "public").eq("status", "open");
      }

      if (filters?.minCapital) {
        query = query.gte("capital_needed", filters.minCapital);
      }
      if (filters?.maxCapital) {
        query = query.lte("capital_needed", filters.maxCapital);
      }
      if (filters?.dealType && filters.dealType !== "all") {
        query = query.eq("deal_type", filters.dealType);
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as JVOpportunity[];
    },
  });
}

export function useJVOpportunity(id: string) {
  return useQuery({
    queryKey: ["jv-opportunity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jv_opportunities")
        .select(`
          *,
          property:properties(address, city, state)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as JVOpportunity;
    },
    enabled: !!id,
  });
}

export function useCreateJVOpportunity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<Partial<JVOpportunity>, 'property' | 'user_id'>) => {
      if (!user) throw new Error("Not authenticated");
      const insertData = {
        user_id: user.id,
        title: data.title || "",
        description: data.description,
        capital_needed: data.capital_needed,
        your_contribution: data.your_contribution,
        seeking: data.seeking,
        proposed_split: data.proposed_split,
        deal_type: data.deal_type,
        location: data.location,
        status: data.status || "open",
        visibility: data.visibility || "public",
        expires_at: data.expires_at,
        property_id: data.property_id,
      };
      const { data: result, error } = await supabase
        .from("jv_opportunities")
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jv-opportunities"] });
      toast.success("Opportunity posted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateJVOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<JVOpportunity> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("jv_opportunities")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jv-opportunities"] });
      toast.success("Opportunity updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteJVOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("jv_opportunities")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jv-opportunities"] });
      toast.success("Opportunity deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============ JV INQUIRIES ============

export function useJVInquiries(opportunityId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["jv-inquiries", opportunityId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("jv_inquiries")
        .select(`
          *,
          opportunity:jv_opportunities(*)
        `);

      if (opportunityId) {
        query = query.eq("opportunity_id", opportunityId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as JVInquiry[];
    },
    enabled: !!user,
  });
}

export function useMyInquiries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["jv-inquiries", "mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("jv_inquiries")
        .select(`
          *,
          opportunity:jv_opportunities(*)
        `)
        .eq("inquirer_user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JVInquiry[];
    },
    enabled: !!user,
  });
}

export function useCreateJVInquiry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { opportunity_id: string; message: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data: result, error } = await supabase
        .from("jv_inquiries")
        .insert({ ...data, inquirer_user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jv-inquiries"] });
      toast.success("Interest expressed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateJVInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: result, error } = await supabase
        .from("jv_inquiries")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["jv-inquiries"] });
      toast.success(`Inquiry ${status}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

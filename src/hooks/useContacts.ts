import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate, Json } from "@/integrations/supabase/types";

// Extended contact types for real estate CRM
export type ContactType = 
  | "agent" 
  | "seller" 
  | "lender" 
  | "buyer" 
  | "wholesaler"
  | "contractor"
  | "title_company" 
  | "attorney" 
  | "property_manager" 
  | "inspector";

export type ContactStatus = "cold" | "contacted" | "responded" | "active" | "inactive";

export type Contact = Tables<"deal_sources"> & {
  // Type-specific computed properties
  buy_box?: BuyBox | null;
  lending_criteria?: LendingCriteria | null;
};

export type ContactInsert = TablesInsert<"deal_sources">;
export type ContactUpdate = TablesUpdate<"deal_sources">;

export interface BuyBox {
  property_types?: string[];
  price_min?: number;
  price_max?: number;
  target_areas?: string[];
  condition_preferences?: string[];
  min_roi?: number;
  closing_timeline?: string;
}

export interface LendingCriteria {
  loan_types?: string[];
  ltv_max?: number;
  rate_range?: { min: number; max: number };
  min_credit_score?: number;
  property_types?: string[];
}

export interface ContactFilters {
  type?: ContactType | "all";
  status?: ContactStatus | "all";
  performance?: "all" | "top" | "new" | "verified";
  search?: string;
  sortBy?: "newest" | "deals" | "profit" | "last_contact" | "rating";
  tags?: string[];
}

// Type-specific stat configurations
export interface ContactStats {
  total: number;
  active: number;
  dealsThisMonth: number;
  totalProfit: number;
  // Type-specific metrics
  verified?: number;
  topRated?: number;
  activeJobs?: number;
  pofVerified?: number;
  licenseVerified?: number;
}

export function useContacts(filters: ContactFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contacts", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("deal_sources")
        .select("*")
        .eq("user_id", user.id);

      // Filter by type
      if (filters.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      // Filter by status
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Filter by performance
      if (filters.performance === "top") {
        query = query.gte("deals_closed", 5);
      } else if (filters.performance === "new") {
        query = query.eq("deals_closed", 0);
      } else if (filters.performance === "verified") {
        query = query.or("pof_verified.eq.true,license_verified.eq.true");
      }

      // Search
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`name.ilike.${searchTerm},company.ilike.${searchTerm},email.ilike.${searchTerm}`);
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      // Sorting
      switch (filters.sortBy) {
        case "deals":
          query = query.order("deals_closed", { ascending: false });
          break;
        case "profit":
          query = query.order("total_profit", { ascending: false });
          break;
        case "last_contact":
          query = query.order("last_contact_date", { ascending: false, nullsFirst: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false, nullsFirst: false });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(d => ({
        ...d,
        buy_box: d.buy_box as BuyBox | null,
        lending_criteria: d.lending_criteria as LendingCriteria | null,
      })) as Contact[];
    },
    enabled: !!user?.id,
  });
}

export function useContactStats(type?: ContactType | "all") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contact-stats", user?.id, type],
    queryFn: async () => {
      if (!user?.id) return null;

      let query = supabase
        .from("deal_sources")
        .select("type, status, deals_closed, total_profit, pof_verified, license_verified, rating, jobs_completed")
        .eq("user_id", user.id);

      if (type && type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;

      const contacts = data || [];
      const total = contacts.length;
      const active = contacts.filter((d) => d.status === "active").length;
      const totalDeals = contacts.reduce((sum, d) => sum + (d.deals_closed || 0), 0);
      const totalProfit = contacts.reduce((sum, d) => sum + Number(d.total_profit || 0), 0);
      
      // Type-specific stats
      const pofVerified = contacts.filter((d) => d.pof_verified).length;
      const licenseVerified = contacts.filter((d) => d.license_verified).length;
      const topRated = contacts.filter((d) => (d.rating || 0) >= 4.5).length;
      const totalJobs = contacts.reduce((sum, d) => sum + (d.jobs_completed || 0), 0);

      return {
        total,
        active,
        dealsThisMonth: totalDeals,
        totalProfit,
        pofVerified,
        licenseVerified,
        topRated,
        activeJobs: totalJobs,
      } as ContactStats;
    },
    enabled: !!user?.id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ContactInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("deal_sources")
        .insert({ 
          ...data, 
          user_id: user.id,
          buy_box: data.buy_box as Json,
          lending_criteria: data.lending_criteria as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources-stats"] });
      toast.success("Contact added successfully");
    },
    onError: (error) => {
      console.error("Error creating contact:", error);
      toast.error("Failed to add contact");
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ContactUpdate }) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update({
          ...updates,
          buy_box: updates.buy_box as Json,
          lending_criteria: updates.lending_criteria as Json,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Contact updated successfully");
    },
    onError: (error) => {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("deal_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Contact deleted");
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    },
  });
}

export function useLogContactInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("deal_sources")
        .update({ last_contact_date: new Date().toISOString().split("T")[0] })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      toast.success("Contact logged");
    },
    onError: (error) => {
      console.error("Error logging contact:", error);
      toast.error("Failed to log contact");
    },
  });
}

// Helper to get display config for contact types
export const contactTypeConfig: Record<ContactType, { label: string; color: string; bgColor: string }> = {
  agent: { label: "Agent", color: "text-violet-700", bgColor: "bg-violet-100" },
  seller: { label: "Seller", color: "text-orange-700", bgColor: "bg-orange-100" },
  lender: { label: "Lender", color: "text-rose-700", bgColor: "bg-rose-100" },
  buyer: { label: "Buyer", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  wholesaler: { label: "Wholesaler", color: "text-cyan-700", bgColor: "bg-cyan-100" },
  contractor: { label: "Contractor", color: "text-amber-700", bgColor: "bg-amber-100" },
  title_company: { label: "Title Company", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  attorney: { label: "Attorney", color: "text-slate-700", bgColor: "bg-slate-100" },
  property_manager: { label: "Property Manager", color: "text-teal-700", bgColor: "bg-teal-100" },
  inspector: { label: "Inspector", color: "text-sky-700", bgColor: "bg-sky-100" },
};

export const contactStatusConfig: Record<ContactStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  cold: { label: "Cold", color: "text-slate-600", bgColor: "bg-slate-100", borderColor: "border-l-slate-400" },
  contacted: { label: "Contacted", color: "text-sky-700", bgColor: "bg-sky-100", borderColor: "border-l-sky-500" },
  responded: { label: "Responded", color: "text-amber-700", bgColor: "bg-amber-100", borderColor: "border-l-amber-500" },
  active: { label: "Active", color: "text-emerald-700", bgColor: "bg-emerald-100", borderColor: "border-l-emerald-500" },
  inactive: { label: "Inactive", color: "text-red-700", bgColor: "bg-red-100", borderColor: "border-l-red-500" },
};

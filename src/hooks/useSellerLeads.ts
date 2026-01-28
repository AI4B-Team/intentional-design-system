import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SellerLead {
  id: string;
  user_id: string;
  website_id: string | null;
  organization_id: string | null;
  property_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  property_address: string;
  property_city: string | null;
  property_state: string | null;
  property_zip: string | null;
  property_condition: string | null;
  property_type: string | null;
  sell_timeline: string | null;
  reason_selling: string | null;
  asking_price: number | null;
  mortgage_balance: number | null;
  has_mortgage: boolean | null;
  is_listed: boolean | null;
  is_owner: boolean | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  lot_size: string | null;
  notes: string | null;
  how_heard: string | null;
  status: string | null;
  auto_score: number | null;
  motivation_indicators: string[] | null;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  auto_email_sent: boolean | null;
  auto_sms_sent: boolean | null;
  owner_notified: boolean | null;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  followup_notes: string | null;
  converted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined fields
  website?: {
    name: string;
    slug: string;
  };
}

export interface LeadFilters {
  websiteId?: string;
  status?: string[];
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  timeline?: string;
  search?: string;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  appointment: number;
  converted: number;
}

export function useSellerLeads(filters: LeadFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("seller_leads")
        .select(`
          *,
          website:seller_websites(name, slug)
        `)
        .order("created_at", { ascending: false });

      if (filters.websiteId) {
        query = query.eq("website_id", filters.websiteId);
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      if (filters.scoreMin !== undefined) {
        query = query.gte("auto_score", filters.scoreMin);
      }

      if (filters.scoreMax !== undefined) {
        query = query.lte("auto_score", filters.scoreMax);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      if (filters.timeline) {
        query = query.eq("sell_timeline", filters.timeline);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,property_address.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SellerLead[];
    },
    enabled: !!user?.id,
  });
}

export function useSellerLead(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("seller_leads")
        .select(`
          *,
          website:seller_websites(name, slug)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as SellerLead;
    },
    enabled: !!user?.id && !!id,
  });
}

export function useLeadStats(websiteId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-leads-stats", websiteId],
    queryFn: async () => {
      let query = supabase.from("seller_leads").select("status");

      if (websiteId) {
        query = query.eq("website_id", websiteId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const leads = data || [];
      return {
        total: leads.length,
        new: leads.filter((l) => l.status === "new").length,
        contacted: leads.filter((l) => l.status === "contacted").length,
        qualified: leads.filter((l) => l.status === "qualified").length,
        appointment: leads.filter((l) => l.status === "appointment").length,
        converted: leads.filter((l) => l.status === "closed").length,
      } as LeadStats;
    },
    enabled: !!user?.id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<SellerLead>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const insertData = {
        user_id: user.id,
        property_address: data.property_address || "",
        ...data,
        status: data.status || "new",
      };

      const { data: lead, error } = await supabase
        .from("seller_leads")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return lead as SellerLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads"] });
      queryClient.invalidateQueries({ queryKey: ["seller-leads-stats"] });
      toast.success("Lead added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add lead");
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SellerLead> }) => {
      const { data: lead, error } = await supabase
        .from("seller_leads")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return lead as SellerLead;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads"] });
      queryClient.invalidateQueries({ queryKey: ["seller-lead", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["seller-leads-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update lead");
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seller_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads"] });
      queryClient.invalidateQueries({ queryKey: ["seller-leads-stats"] });
      toast.success("Lead deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete lead");
    },
  });
}

export function useDeleteLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("seller_leads").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads"] });
      queryClient.invalidateQueries({ queryKey: ["seller-leads-stats"] });
      toast.success("Leads deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete leads");
    },
  });
}

export function useConvertLeadToProperty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lead, propertyData }: { lead: SellerLead; propertyData: any }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Create property
      const propertyInsert: Record<string, unknown> = {
        user_id: user.id,
        address: lead.property_address,
        city: lead.property_city,
        state: lead.property_state,
        zip: lead.property_zip,
        beds: lead.beds,
        baths: lead.baths,
        sqft: lead.sqft,
        year_built: lead.year_built,
        seller_name: lead.full_name,
        seller_phone: lead.phone,
        seller_email: lead.email,
        condition: lead.property_condition,
        seller_motivation: lead.reason_selling,
      };
      
      if (propertyData.copyNotes && lead.notes) {
        propertyInsert.notes = lead.notes;
      }
      if (propertyData.status) {
        propertyInsert.status = propertyData.status;
      }
      if (propertyData.pipeline_stage) {
        propertyInsert.pipeline_stage = propertyData.pipeline_stage;
      }
      if (propertyData.tags) {
        propertyInsert.tags = propertyData.tags;
      }

      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert(propertyInsert as any)
        .select()
        .single();

      if (propError) throw propError;

      // Update lead with property_id and converted_at
      const { error: leadError } = await supabase
        .from("seller_leads")
        .update({
          property_id: property.id,
          converted_at: new Date().toISOString(),
          status: "closed",
        })
        .eq("id", lead.id);

      if (leadError) throw leadError;

      return property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-leads"] });
      queryClient.invalidateQueries({ queryKey: ["seller-leads-stats"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property created from lead");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to convert lead");
    },
  });
}

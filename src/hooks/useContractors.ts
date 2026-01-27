import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Contractor {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  specialties: string[];
  service_areas: string[];
  quality_rating: number | null;
  reliability_rating: number | null;
  communication_rating: number | null;
  overall_rating: number | null;
  jobs_completed: number;
  avg_bid_accuracy: number | null;
  on_time_percentage: number | null;
  license_number: string | null;
  license_verified: boolean;
  insurance_verified: boolean;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  property_id: string;
  contractor_id: string;
  user_id: string;
  scope_of_work: string | null;
  scope_items: any[];
  bid_amount: number | null;
  timeline_days: number | null;
  valid_until: string | null;
  status: string;
  requested_at: string;
  received_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contractor?: Contractor;
}

export function useContractors() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Contractor[];
    },
    enabled: !!user,
  });
}

export function useContractor(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["contractor", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Contractor;
    },
    enabled: !!user && !!id,
  });
}

export function useContractorStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["contractor-stats"],
    queryFn: async () => {
      const { data: contractors, error } = await supabase
        .from("contractors")
        .select("overall_rating, status");

      if (error) throw error;

      const { count: activeBids } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .in("status", ["requested", "received"]);

      return {
        total: contractors?.length || 0,
        topRated: contractors?.filter(c => (c.overall_rating || 0) >= 4.5).length || 0,
        activeJobs: activeBids || 0,
      };
    },
    enabled: !!user,
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contractor: Omit<Partial<Contractor>, 'user_id'>) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("contractors")
        .insert({
          name: contractor.name!,
          user_id: user.id,
          company: contractor.company,
          phone: contractor.phone,
          email: contractor.email,
          specialties: contractor.specialties,
          service_areas: contractor.service_areas,
          license_number: contractor.license_number,
          notes: contractor.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({ queryKey: ["contractor-stats"] });
      toast.success("Contractor added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add contractor");
    },
  });
}

export function useUpdateContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contractor> }) => {
      const { data, error } = await supabase
        .from("contractors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({ queryKey: ["contractor", id] });
      toast.success("Contractor updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update contractor");
    },
  });
}

export function useDeleteContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contractors")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({ queryKey: ["contractor-stats"] });
      toast.success("Contractor deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete contractor");
    },
  });
}

// Bids hooks
export function usePropertyBids(propertyId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["property-bids", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from("bids")
        .select(`
          *,
          contractor:contractor_id (*)
        `)
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Bid & { contractor: Contractor })[];
    },
    enabled: !!user && !!propertyId,
  });
}

export function useContractorBids(contractorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["contractor-bids", contractorId],
    queryFn: async () => {
      if (!contractorId) return [];
      
      const { data, error } = await supabase
        .from("bids")
        .select(`
          *,
          properties:property_id (id, address, city, state)
        `)
        .eq("contractor_id", contractorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!contractorId,
  });
}

interface CreateBidInput {
  property_id: string;
  contractor_id: string;
  scope_of_work?: string;
  scope_items?: any[];
  valid_until?: string;
  status?: string;
  notes?: string;
}

export function useCreateBid() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bids: CreateBidInput[]) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("bids")
        .insert(bids.map(b => ({
          property_id: b.property_id,
          contractor_id: b.contractor_id,
          user_id: user.id,
          scope_of_work: b.scope_of_work,
          scope_items: b.scope_items,
          valid_until: b.valid_until,
          status: b.status || "requested",
          notes: b.notes,
        })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-bids"] });
      queryClient.invalidateQueries({ queryKey: ["contractor-bids"] });
      toast.success("Bid request(s) sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create bid request");
    },
  });
}

export function useUpdateBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bid> }) => {
      const { data, error } = await supabase
        .from("bids")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-bids"] });
      queryClient.invalidateQueries({ queryKey: ["contractor-bids"] });
      toast.success("Bid updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update bid");
    },
  });
}

export function useAcceptBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bidId, propertyId, amount }: { bidId: string; propertyId: string; amount: number }) => {
      // Accept this bid
      const { error: bidError } = await supabase
        .from("bids")
        .update({ status: "accepted" })
        .eq("id", bidId);

      if (bidError) throw bidError;

      // Decline other bids for this property
      const { error: declineError } = await supabase
        .from("bids")
        .update({ status: "declined" })
        .eq("property_id", propertyId)
        .neq("id", bidId)
        .in("status", ["requested", "received"]);

      if (declineError) throw declineError;

      // Update property repair estimate
      const { error: propError } = await supabase
        .from("properties")
        .update({ repair_estimate: amount })
        .eq("id", propertyId);

      if (propError) throw propError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-bids"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Bid accepted! Repair estimate updated.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept bid");
    },
  });
}

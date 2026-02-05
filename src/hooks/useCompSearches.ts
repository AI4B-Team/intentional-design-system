 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { useAuth } from "@/contexts/AuthContext";
 import { useOrganization } from "@/contexts/OrganizationContext";
 import type { Json } from "@/integrations/supabase/types";
 
 export interface CompSearch {
   id: string;
   user_id: string;
   organization_id: string | null;
   subject_property_id: string | null;
   subject_address: string;
   subject_city: string | null;
   subject_state: string | null;
   subject_zip: string | null;
   search_params: Record<string, unknown> | null;
   comps_found: number;
   avg_price_per_sqft: number | null;
   avg_sale_price: number | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface CompSearchInsert {
   subject_property_id?: string | null;
   subject_address: string;
   subject_city?: string | null;
   subject_state?: string | null;
   subject_zip?: string | null;
   search_params?: Record<string, unknown> | null;
   comps_found?: number;
   avg_price_per_sqft?: number | null;
   avg_sale_price?: number | null;
 }
 
 export function useCompSearches() {
   return useQuery({
     queryKey: ["comp-searches"],
     queryFn: async (): Promise<CompSearch[]> => {
       const { data, error } = await supabase
         .from("comp_searches")
         .select("*")
         .order("created_at", { ascending: false })
         .limit(50);
 
       if (error) throw error;
       return (data || []) as CompSearch[];
     },
   });
 }
 
 export function useCompSearchByAddress(address: string | undefined) {
   return useQuery({
     queryKey: ["comp-search-by-address", address],
     queryFn: async (): Promise<CompSearch | null> => {
       if (!address) return null;
       
       const normalizedAddress = address.toLowerCase().trim();
       
       const { data, error } = await supabase
         .from("comp_searches")
         .select("*")
         .ilike("subject_address", `%${normalizedAddress}%`)
         .order("created_at", { ascending: false })
         .limit(1)
         .maybeSingle();
 
       if (error) throw error;
       return data as CompSearch | null;
     },
     enabled: !!address,
   });
 }
 
 export function useSaveCompSearch() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
   const { organization } = useOrganization();
 
   return useMutation({
     mutationFn: async (search: CompSearchInsert) => {
       if (!user?.id) throw new Error("User not authenticated");
 
       const { data, error } = await supabase
         .from("comp_searches")
         .insert([{
           subject_address: search.subject_address,
           subject_city: search.subject_city ?? null,
           subject_state: search.subject_state ?? null,
           subject_zip: search.subject_zip ?? null,
           subject_property_id: search.subject_property_id ?? null,
           search_params: (search.search_params ?? null) as Json | null,
           comps_found: search.comps_found ?? 0,
           avg_price_per_sqft: search.avg_price_per_sqft ?? null,
           avg_sale_price: search.avg_sale_price ?? null,
           user_id: user.id,
           organization_id: organization?.id ?? null,
         }])
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["comp-searches"] });
       toast.success("Comp search saved");
     },
     onError: (error: Error) => {
       toast.error(error.message || "Failed to save comp search");
     },
   });
 }
 
 export function useDeleteCompSearch() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from("comp_searches")
         .delete()
         .eq("id", id);
 
       if (error) throw error;
       return id;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["comp-searches"] });
       toast.success("Comp search deleted");
     },
     onError: (error: Error) => {
       toast.error(error.message || "Failed to delete comp search");
     },
   });
 }
 
 /**
  * Formats the time difference between now and a given date
  */
 export function formatTimeAgo(dateString: string): string {
   const date = new Date(dateString);
   const now = new Date();
   const diffMs = now.getTime() - date.getTime();
   
   const minutes = Math.floor(diffMs / (1000 * 60));
   const hours = Math.floor(diffMs / (1000 * 60 * 60));
   const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
   const weeks = Math.floor(days / 7);
   const months = Math.floor(days / 30);
 
   if (months > 0) {
     return `${months} month${months > 1 ? 's' : ''} ago`;
   } else if (weeks > 0) {
     return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
   } else if (days > 0) {
     return `${days} day${days > 1 ? 's' : ''} ago`;
   } else if (hours > 0) {
     return `${hours} hour${hours > 1 ? 's' : ''} ago`;
   } else if (minutes > 0) {
     return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
   }
   return 'Just now';
 }
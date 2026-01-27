import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Fetch deliveries for a specific offer
export function useOfferDeliveries(offerId: string | undefined) {
  return useQuery({
    queryKey: ["offer-deliveries", offerId],
    queryFn: async () => {
      if (!offerId) return [];
      
      const { data, error } = await supabase
        .from("offer_deliveries")
        .select("*")
        .eq("offer_id", offerId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });
}

// Fetch followups for a specific offer
export function useOfferFollowups(offerId: string | undefined) {
  return useQuery({
    queryKey: ["offer-followups", offerId],
    queryFn: async () => {
      if (!offerId) return [];
      
      const { data, error } = await supabase
        .from("offer_followups")
        .select("*")
        .eq("offer_id", offerId)
        .order("sequence_number", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });
}

// Fetch all offers with deliveries for dashboard
export function useAllOffers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["all-offers"],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          properties:property_id (
            id,
            address,
            city,
            state,
            owner_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch offer statistics
export function useOfferStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["offer-stats"],
    queryFn: async () => {
      if (!user) return null;
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all offers
      const { data: offers, error: offersError } = await supabase
        .from("offers")
        .select("*");

      if (offersError) throw offersError;

      // Get all deliveries
      const { data: deliveries, error: deliveriesError } = await supabase
        .from("offer_deliveries")
        .select("*");

      if (deliveriesError) throw deliveriesError;

      const thisWeekOffers = offers?.filter(o => new Date(o.created_at || 0) >= weekAgo) || [];
      const thisMonthOffers = offers?.filter(o => new Date(o.created_at || 0) >= monthAgo) || [];
      
      const sentDeliveries = deliveries?.filter(d => d.status !== "queued" && d.status !== "failed") || [];
      const openedDeliveries = deliveries?.filter(d => d.opened_at) || [];
      const respondedOffers = offers?.filter(o => o.response && o.response !== "pending") || [];

      return {
        totalOffers: offers?.length || 0,
        offersThisWeek: thisWeekOffers.length,
        offersThisMonth: thisMonthOffers.length,
        deliveryRate: sentDeliveries.length > 0 
          ? Math.round((sentDeliveries.filter(d => d.status === "delivered").length / sentDeliveries.length) * 100) 
          : 0,
        openRate: sentDeliveries.length > 0 
          ? Math.round((openedDeliveries.length / sentDeliveries.length) * 100) 
          : 0,
        responseRate: offers?.length > 0 
          ? Math.round((respondedOffers.length / offers.length) * 100) 
          : 0,
        pendingOffers: offers?.filter(o => !o.response || o.response === "pending").length || 0,
      };
    },
    enabled: !!user,
  });
}

// Fetch recent offer activity
export function useOfferActivity() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["offer-activity"],
    queryFn: async () => {
      if (!user) return [];
      
      // Get recent deliveries with offer and property info
      const { data: deliveries, error } = await supabase
        .from("offer_deliveries")
        .select(`
          *,
          offers:offer_id (
            id,
            offer_amount,
            properties:property_id (
              id,
              address,
              owner_name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform into activity items
      const activities: any[] = [];
      
      deliveries?.forEach(d => {
        if (d.sent_at) {
          activities.push({
            id: `${d.id}-sent`,
            type: "sent",
            channel: d.channel,
            timestamp: d.sent_at,
            propertyAddress: (d.offers as any)?.properties?.address,
            ownerName: (d.offers as any)?.properties?.owner_name,
            offerId: (d.offers as any)?.id,
            propertyId: (d.offers as any)?.properties?.id,
          });
        }
        if (d.opened_at) {
          activities.push({
            id: `${d.id}-opened`,
            type: "opened",
            channel: d.channel,
            timestamp: d.opened_at,
            propertyAddress: (d.offers as any)?.properties?.address,
            ownerName: (d.offers as any)?.properties?.owner_name,
            offerId: (d.offers as any)?.id,
            propertyId: (d.offers as any)?.properties?.id,
          });
        }
        if (d.clicked_at) {
          activities.push({
            id: `${d.id}-clicked`,
            type: "clicked",
            channel: d.channel,
            timestamp: d.clicked_at,
            propertyAddress: (d.offers as any)?.properties?.address,
            ownerName: (d.offers as any)?.properties?.owner_name,
            offerId: (d.offers as any)?.id,
            propertyId: (d.offers as any)?.properties?.id,
          });
        }
      });
      
      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return activities.slice(0, 20);
    },
    enabled: !!user,
  });
}

// Cancel remaining followups
export function useCancelFollowups() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase
        .from("offer_followups")
        .update({ status: "cancelled" })
        .eq("offer_id", offerId)
        .eq("status", "scheduled");

      if (error) throw error;
    },
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: ["offer-followups", offerId] });
      toast.success("Remaining follow-ups cancelled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel follow-ups");
    },
  });
}

// Send next followup now
export function useSendFollowupNow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (followupId: string) => {
      const { error } = await supabase
        .from("offer_followups")
        .update({ 
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", followupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-followups"] });
      toast.success("Follow-up sent!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send follow-up");
    },
  });
}

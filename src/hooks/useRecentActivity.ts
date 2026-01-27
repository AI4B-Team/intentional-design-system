import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export type ActivityType = 
  | "property_added" 
  | "offer_sent" 
  | "response_received" 
  | "appointment_scheduled" 
  | "status_changed";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  relativeTime: string;
  propertyId?: string;
  propertyAddress?: string;
}

export function useRecentActivity(limit = 20) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async (): Promise<RecentActivity[]> => {
      const activities: RecentActivity[] = [];

      // Fetch recent data in parallel
      const [propertiesResult, offersResult, appointmentsResult] = await Promise.all([
        // Recent properties
        supabase
          .from("properties")
          .select("id, address, created_at, status")
          .order("created_at", { ascending: false })
          .limit(10),

        // Recent offers
        supabase
          .from("offers")
          .select(`
            id,
            offer_amount,
            response,
            created_at,
            sent_date,
            property_id,
            properties!inner(address)
          `)
          .order("created_at", { ascending: false })
          .limit(10),

        // Recent appointments
        supabase
          .from("appointments")
          .select(`
            id,
            appointment_type,
            scheduled_time,
            created_at,
            property_id,
            properties!inner(address)
          `)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      // Process properties
      propertiesResult.data?.forEach((prop) => {
        activities.push({
          id: `prop-${prop.id}`,
          type: "property_added",
          description: `New property added: ${prop.address}`,
          timestamp: prop.created_at || new Date().toISOString(),
          relativeTime: formatDistanceToNow(new Date(prop.created_at || new Date()), { addSuffix: true }),
          propertyId: prop.id,
          propertyAddress: prop.address,
        });
      });

      // Process offers
      offersResult.data?.forEach((offer) => {
        const property = offer.properties as unknown as { address: string };
        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(offer.offer_amount);

        if (offer.response && offer.response !== "pending") {
          activities.push({
            id: `offer-resp-${offer.id}`,
            type: "response_received",
            description: `Offer ${offer.response}: ${formattedAmount} on ${property.address}`,
            timestamp: offer.created_at || new Date().toISOString(),
            relativeTime: formatDistanceToNow(new Date(offer.created_at || new Date()), { addSuffix: true }),
            propertyId: offer.property_id,
            propertyAddress: property.address,
          });
        } else {
          activities.push({
            id: `offer-${offer.id}`,
            type: "offer_sent",
            description: `Offer sent: ${formattedAmount} on ${property.address}`,
            timestamp: offer.sent_date || offer.created_at || new Date().toISOString(),
            relativeTime: formatDistanceToNow(new Date(offer.sent_date || offer.created_at || new Date()), { addSuffix: true }),
            propertyId: offer.property_id,
            propertyAddress: property.address,
          });
        }
      });

      // Process appointments
      appointmentsResult.data?.forEach((apt) => {
        const property = apt.properties as unknown as { address: string };
        activities.push({
          id: `apt-${apt.id}`,
          type: "appointment_scheduled",
          description: `${apt.appointment_type || "Appointment"} scheduled for ${property.address}`,
          timestamp: apt.created_at || new Date().toISOString(),
          relativeTime: formatDistanceToNow(new Date(apt.created_at || new Date()), { addSuffix: true }),
          propertyId: apt.property_id,
          propertyAddress: property.address,
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    refetchInterval: 30000,
  });
}

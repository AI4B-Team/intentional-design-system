import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Buyer, BuyBox } from "./useBuyers";

export interface PropertyForMatching {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  arv: number | null;
  repair_estimate: number | null;
  mao_standard: number | null;
  status: string | null;
}

export interface BuyerMatch {
  buyer: Buyer;
  matchScore: number;
  buyBoxFit: number;
  activityScore: number;
  reliabilityScore: number;
  closeRateScore: number;
  matchDetails: {
    propertyTypeMatch: boolean;
    priceMatch: boolean;
    areaMatch: boolean;
    conditionMatch: boolean;
  };
}

function calculateMatchScore(
  buyer: Buyer,
  property: PropertyForMatching
): BuyerMatch {
  const buyBox = buyer.buy_box || {};
  let buyBoxFit = 0;
  let matchCount = 0;
  let totalCriteria = 0;

  const matchDetails = {
    propertyTypeMatch: false,
    priceMatch: false,
    areaMatch: false,
    conditionMatch: false,
  };

  // Property type match (25%)
  totalCriteria++;
  if (buyBox.property_types?.length) {
    const propertyType = property.property_type?.toUpperCase() || "";
    const buyerTypes = buyBox.property_types.map((t) => t.toUpperCase());
    if (
      buyerTypes.some(
        (t) => propertyType.includes(t) || t.includes("SFH") && propertyType.includes("SINGLE")
      )
    ) {
      matchDetails.propertyTypeMatch = true;
      matchCount++;
    }
  } else {
    matchDetails.propertyTypeMatch = true;
    matchCount++;
  }

  // Price match (25%)
  totalCriteria++;
  const askingPrice = property.mao_standard || property.arv || 0;
  if (buyBox.price_min || buyBox.price_max) {
    const minOk = !buyBox.price_min || askingPrice >= buyBox.price_min;
    const maxOk = !buyBox.price_max || askingPrice <= buyBox.price_max;
    if (minOk && maxOk) {
      matchDetails.priceMatch = true;
      matchCount++;
    }
  } else {
    matchDetails.priceMatch = true;
    matchCount++;
  }

  // Area match (25%)
  totalCriteria++;
  if (buyBox.target_areas?.length) {
    const propertyZip = property.zip || "";
    const propertyCity = property.city?.toLowerCase() || "";
    const targetAreas = buyBox.target_areas.map((a) => a.toLowerCase());
    if (
      targetAreas.some(
        (area) =>
          propertyZip.includes(area) ||
          area.includes(propertyZip) ||
          propertyCity.includes(area) ||
          area.includes(propertyCity)
      )
    ) {
      matchDetails.areaMatch = true;
      matchCount++;
    }
  } else {
    matchDetails.areaMatch = true;
    matchCount++;
  }

  // Condition match (25%) - always match if not specified
  totalCriteria++;
  matchDetails.conditionMatch = true;
  matchCount++;

  buyBoxFit = totalCriteria > 0 ? (matchCount / totalCriteria) * 100 : 100;

  // Activity score (0-100) based on last activity
  let activityScore = 0;
  if (buyer.last_activity) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(buyer.last_activity).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActivity <= 7) activityScore = 100;
    else if (daysSinceActivity <= 14) activityScore = 80;
    else if (daysSinceActivity <= 30) activityScore = 60;
    else if (daysSinceActivity <= 60) activityScore = 40;
    else activityScore = 20;
  }

  // Reliability score is already 0-100
  const reliabilityScore = buyer.reliability_score || 50;

  // Close rate score
  const closeRateScore =
    buyer.deals_viewed > 0
      ? Math.min(100, (buyer.deals_closed / buyer.deals_viewed) * 100 * 2)
      : 50;

  // Calculate weighted match score
  const matchScore = Math.round(
    buyBoxFit * 0.4 +
      activityScore * 0.2 +
      reliabilityScore * 0.2 +
      closeRateScore * 0.2
  );

  return {
    buyer,
    matchScore,
    buyBoxFit: Math.round(buyBoxFit),
    activityScore,
    reliabilityScore,
    closeRateScore: Math.round(closeRateScore),
    matchDetails,
  };
}

export function useMatchingBuyers(property: PropertyForMatching | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["matching-buyers", property?.id],
    queryFn: async (): Promise<BuyerMatch[]> => {
      if (!property) return [];

      const { data: buyers, error } = await supabase
        .from("buyers")
        .select("*");

      if (error) throw error;

      const buyersTyped = (buyers || []).map((b) => ({
        ...b,
        buy_box: (b.buy_box as BuyBox) || {},
      })) as Buyer[];

      // Calculate match scores for all buyers
      const matches = buyersTyped.map((buyer) => calculateMatchScore(buyer, property));

      // Sort by match score descending
      return matches.sort((a, b) => b.matchScore - a.matchScore);
    },
    enabled: !!user && !!property,
  });
}

export interface SendDealPayload {
  propertyId: string;
  buyerIds: string[];
  channels: ("email" | "sms")[];
  subject?: string;
  message?: string;
  dealSheet: {
    askingPrice: number;
    arv?: number;
    repairs?: number;
    spread?: number;
    assignmentFee: number;
  };
  urgency: "standard" | "urgent" | "exclusive";
}

export function useSendDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: SendDealPayload) => {
      if (!user) throw new Error("Not authenticated");

      // Create outreach log entries for each buyer
      const outreachEntries = payload.buyerIds.flatMap((buyerId) =>
        payload.channels.map((channel) => ({
          user_id: user.id,
          target_id: buyerId,
          target_type: "buyer",
          channel,
          direction: "outbound",
          content: JSON.stringify({
            property_id: payload.propertyId,
            subject: payload.subject,
            message: payload.message,
            deal_sheet: payload.dealSheet,
            urgency: payload.urgency,
          }),
          status: "sent",
        }))
      );

      const { error: outreachError } = await supabase
        .from("outreach_log")
        .insert(outreachEntries);

      if (outreachError) throw outreachError;

      // Update deals_viewed count for each buyer
      for (const buyerId of payload.buyerIds) {
        const { data: buyer } = await supabase
          .from("buyers")
          .select("deals_viewed")
          .eq("id", buyerId)
          .single();

        if (buyer) {
          await supabase
            .from("buyers")
            .update({
              deals_viewed: (buyer.deals_viewed || 0) + 1,
              last_activity: new Date().toISOString(),
            })
            .eq("id", buyerId);
        }
      }

      return { sentCount: payload.buyerIds.length * payload.channels.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["outreach-log"] });
      toast.success(`Deal sent to ${data.sentCount} recipients`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send deal");
    },
  });
}

export interface BuyerResponse {
  buyerId: string;
  response: "interested" | "passed" | "no_response";
  reason?: string;
}

export function useUpdateBuyerResponse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: BuyerResponse & { propertyId: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Log the response
      const { error } = await supabase.from("outreach_log").insert({
        user_id: user.id,
        target_id: payload.buyerId,
        target_type: "buyer",
        channel: "response",
        direction: "inbound",
        content: JSON.stringify({
          property_id: payload.propertyId,
          response: payload.response,
          reason: payload.reason,
        }),
        status: payload.response,
        response_content: payload.reason || null,
      });

      if (error) throw error;

      // Update buyer's last activity
      await supabase
        .from("buyers")
        .update({ last_activity: new Date().toISOString() })
        .eq("id", payload.buyerId);

      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["property-buyer-responses"] });
      const message =
        data.response === "interested"
          ? "Buyer marked as interested!"
          : data.response === "passed"
          ? "Buyer marked as passed"
          : "Response recorded";
      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record response");
    },
  });
}

export function usePropertyBuyerResponses(propertyId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["property-buyer-responses", propertyId],
    queryFn: async () => {
      if (!propertyId) return {};

      const { data, error } = await supabase
        .from("outreach_log")
        .select("*")
        .eq("target_type", "buyer")
        .eq("channel", "response");

      if (error) throw error;

      // Build a map of buyerId -> latest response
      const responses: Record<string, { response: string; reason?: string; date: string }> = {};

      for (const log of data || []) {
        try {
          const content = JSON.parse(log.content || "{}");
          if (content.property_id === propertyId) {
            responses[log.target_id] = {
              response: content.response,
              reason: content.reason,
              date: log.created_at,
            };
          }
        } catch {
          // Skip invalid JSON
        }
      }

      return responses;
    },
    enabled: !!user && !!propertyId,
  });
}

export function usePropertyDealsSent(propertyId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["property-deals-sent", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];

      const { data, error } = await supabase
        .from("outreach_log")
        .select("*")
        .eq("target_type", "buyer")
        .neq("channel", "response")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter for this property
      return (data || []).filter((log) => {
        try {
          const content = JSON.parse(log.content || "{}");
          return content.property_id === propertyId;
        } catch {
          return false;
        }
      });
    },
    enabled: !!user && !!propertyId,
  });
}

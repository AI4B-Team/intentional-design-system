import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DealSubmission {
  id: string;
  property_id: string | null;
  deal_source_id: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  submitter_company: string | null;
  submitter_type: string | null;
  referral_source: string | null;
  submitted_at: string;
  reviewed: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
  response_sent: boolean;
  notes: string | null;
  property?: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    status: string | null;
  } | null;
}

export interface SubmitDealData {
  // Submitter info
  submitterName: string;
  submitterCompany?: string;
  submitterPhone: string;
  submitterEmail: string;
  referralSource?: string;
  submitterType?: string;
  
  // Property info
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  lotSize?: number;
  
  // Deal details
  askingPrice: number;
  arv?: number;
  repairEstimate?: number;
  isWholesale: boolean;
  assignmentFee?: number;
  propertyCondition?: string;
  occupancy?: string;
  sellerMotivation?: string;
  timeline?: string;
  
  // Additional
  dealNotes?: string;
  additionalNotes?: string;
  photos?: File[];
}

export function useDealSubmissions(filter: "all" | "pending" | "reviewed" = "all") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-submissions", filter],
    queryFn: async () => {
      let query = supabase
        .from("deal_submissions")
        .select(`
          *,
          property:properties(id, address, city, state, status)
        `)
        .order("submitted_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("reviewed", false);
      } else if (filter === "reviewed") {
        query = query.eq("reviewed", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DealSubmission[];
    },
    enabled: !!user?.id,
  });
}

export function usePendingSubmissionsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-submissions-pending-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("deal_submissions")
        .select("*", { count: "exact", head: true })
        .eq("reviewed", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useMarkSubmissionReviewed() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase
        .from("deal_submissions")
        .update({
          reviewed: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["deal-submissions-pending-count"] });
      toast.success("Submission marked as reviewed");
    },
    onError: (error) => {
      console.error("Error marking reviewed:", error);
      toast.error("Failed to update submission");
    },
  });
}

export function useSubmitDeal() {
  return useMutation({
    mutationFn: async (data: SubmitDealData) => {
      // 1. Check if deal source exists by email
      const { data: existingSource } = await supabase
        .from("deal_sources")
        .select("id")
        .eq("email", data.submitterEmail)
        .maybeSingle();

      let dealSourceId = existingSource?.id;

      // 2. Create new deal source if needed
      if (!dealSourceId) {
        const typeMap: Record<string, string> = {
          "Wholesaler": "wholesaler",
          "Agent": "agent",
          "Property Owner": "agent",
          "Other": "agent",
        };

        const { data: newSource, error: sourceError } = await supabase
          .from("deal_sources")
          .insert({
            name: data.submitterName,
            company: data.submitterCompany || null,
            phone: data.submitterPhone,
            email: data.submitterEmail,
            type: typeMap[data.submitterType || "Other"] || "agent",
            source: "deal_submission",
            status: "cold",
            user_id: "00000000-0000-0000-0000-000000000000", // Placeholder for public submissions
          })
          .select()
          .single();

        if (sourceError) throw sourceError;
        dealSourceId = newSource.id;
      }

      // 3. Create property record
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          property_type: data.propertyType || null,
          beds: data.beds || null,
          baths: data.baths || null,
          sqft: data.sqft || null,
          year_built: data.yearBuilt || null,
          lot_size: data.lotSize || null,
          estimated_value: data.askingPrice,
          arv: data.arv || null,
          repair_estimate: data.repairEstimate || null,
          source: "deal_submission",
          source_id: dealSourceId,
          status: "new",
          notes: [
            data.isWholesale ? `Wholesale assignment - Fee: $${data.assignmentFee || 0}` : null,
            data.propertyCondition ? `Condition: ${data.propertyCondition}` : null,
            data.occupancy ? `Occupancy: ${data.occupancy}` : null,
            data.sellerMotivation ? `Motivation: ${data.sellerMotivation}` : null,
            data.timeline ? `Timeline: ${data.timeline}` : null,
            data.dealNotes ? `Deal notes: ${data.dealNotes}` : null,
            data.additionalNotes ? `Additional: ${data.additionalNotes}` : null,
          ].filter(Boolean).join("\n\n"),
          user_id: "00000000-0000-0000-0000-000000000000", // Placeholder for public submissions
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // 4. Upload photos if any
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          const fileName = `${property.id}/${Date.now()}-${photo.name}`;
          const { error: uploadError } = await supabase.storage
            .from("property-photos")
            .upload(fileName, photo);

          if (uploadError) {
            console.error("Photo upload error:", uploadError);
          }
        }
      }

      // 5. Create submission record
      const { data: submission, error: submissionError } = await supabase
        .from("deal_submissions")
        .insert({
          property_id: property.id,
          deal_source_id: dealSourceId,
          submitter_name: data.submitterName,
          submitter_email: data.submitterEmail,
          submitter_phone: data.submitterPhone,
          submitter_company: data.submitterCompany || null,
          submitter_type: data.submitterType || null,
          referral_source: data.referralSource || null,
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // TODO: Send notification email via edge function for new deal submissions

      return { submission, property };
    },
  });
}

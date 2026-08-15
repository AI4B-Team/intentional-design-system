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
    mutationFn: async (
      data: SubmitDealData & { turnstileToken?: string },
    ) => {
      // Photos still upload client-side to storage (property-photos bucket is
      // public). The rest of the submission goes through the rate-limited
      // edge function so anon writes to deal_sources/properties/deal_submissions
      // are no longer allowed from the browser.
      // Public form can be linked with ?org=<workspace id> so the submission
      // lands in the receiving team's workspace.
      const orgParam = new URLSearchParams(window.location.search).get('org');

      const { data: resp, error } = await supabase.functions.invoke('submit-deal', {
        body: {
          organizationId: orgParam || undefined,
          submitterName: data.submitterName,
          submitterCompany: data.submitterCompany,
          submitterPhone: data.submitterPhone,
          submitterEmail: data.submitterEmail,
          referralSource: data.referralSource,
          submitterType: data.submitterType,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          propertyType: data.propertyType,
          beds: data.beds,
          baths: data.baths,
          sqft: data.sqft,
          yearBuilt: data.yearBuilt,
          lotSize: data.lotSize,
          askingPrice: data.askingPrice,
          arv: data.arv,
          repairEstimate: data.repairEstimate,
          isWholesale: data.isWholesale,
          assignmentFee: data.assignmentFee,
          propertyCondition: data.propertyCondition,
          occupancy: data.occupancy,
          sellerMotivation: data.sellerMotivation,
          timeline: data.timeline,
          dealNotes: data.dealNotes,
          additionalNotes: data.additionalNotes,
          turnstileToken: data.turnstileToken,
        },
      });

      if (error) {
        const ctxRes = (error as { context?: { response?: Response } })?.context?.response;
        if (ctxRes?.status === 429) {
          throw new Error('Too many submissions, please try again later.');
        }
        throw new Error(error.message || 'Failed to submit deal');
      }
      if (resp?.error) throw new Error(resp.error);

      const { submission, property } = resp as {
        submission: DealSubmission;
        property: { id: string };
      };

      // Upload photos (best-effort). Storage now requires an authenticated
      // user and an owner-scoped path, so anonymous submissions skip photos.
      if (data.photos && data.photos.length > 0) {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData?.user?.id;
        if (uid) {
          for (const photo of data.photos) {
            const fileName = `${uid}/${property.id}/${Date.now()}-${photo.name}`;
            const { error: uploadError } = await supabase.storage
              .from('property-photos')
              .upload(fileName, photo);
            if (uploadError) {
              console.error('Photo upload error:', uploadError);
            }
          }
        }
      }

      return { submission, property };
    },
  });
}

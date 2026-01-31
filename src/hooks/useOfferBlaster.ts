import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";
import { useEffect } from "react";

// Types
export interface ProofOfFunds {
  id: string;
  user_id: string;
  organization_id: string | null;
  file_name: string;
  file_url: string;
  file_size: number | null;
  expiration_date: string;
  amount: number;
  lender_name: string | null;
  lender_contact: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferTemplate {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  offer_type: string;
  market_type: string;
  document_type: string;
  terms: Record<string, any>;
  email_subject: string | null;
  email_body: string | null;
  email_signature: string | null;
  sms_body: string | null;
  loi_content: string | null;
  include_pof: boolean;
  is_default: boolean;
  is_active: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

// =============== POF Hooks ===============

export function useProofOfFunds() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["proof-of-funds", organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proof_of_funds")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProofOfFunds[];
    },
    enabled: !!organization?.id,
  });
}

export function useExpiringPOFs(daysAhead: number = 5) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["expiring-pofs", organization?.id, daysAhead],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_expiring_pofs", {
        days_ahead: daysAhead,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });
}

export function usePOFExpirationAlert() {
  const { data: expiringPOFs } = useExpiringPOFs(5);

  useEffect(() => {
    if (expiringPOFs && expiringPOFs.length > 0) {
      expiringPOFs.forEach((pof: any) => {
        if (pof.days_until_expiry <= 5) {
          toast.warning(
            `POF "${pof.file_name}" expires in ${pof.days_until_expiry} day${
              pof.days_until_expiry !== 1 ? "s" : ""
            }`,
            {
              description: `Please upload a new Proof of Funds from ${pof.lender_name}`,
              duration: 10000,
            }
          );
        }
      });
    }
  }, [expiringPOFs]);

  return expiringPOFs;
}

export function useUploadPOF() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      file,
      expirationDate,
      amount,
      lenderName,
      lenderContact,
      notes,
    }: {
      file: File;
      expirationDate: string;
      amount: number;
      lenderName: string;
      lenderContact?: string;
      notes?: string;
    }) => {
      if (!user || !organization) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${organization.id}/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("pof-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("pof-documents")
        .getPublicUrl(fileName);

      // Create record
      const { data, error } = await supabase
        .from("proof_of_funds")
        .insert({
          user_id: user.id,
          organization_id: organization.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          expiration_date: expirationDate,
          amount,
          lender_name: lenderName,
          lender_contact: lenderContact || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proof-of-funds"] });
      toast.success("Proof of Funds uploaded successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to upload POF", { description: error.message });
    },
  });
}

export function useDeletePOF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pofId: string) => {
      const { error } = await supabase
        .from("proof_of_funds")
        .update({ is_active: false })
        .eq("id", pofId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proof-of-funds"] });
      toast.success("POF deleted");
    },
    onError: (error: any) => {
      toast.error("Failed to delete POF", { description: error.message });
    },
  });
}

// =============== Offer Template Hooks ===============

export function useOfferTemplates(offerType?: string) {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["offer-templates", organization?.id, offerType],
    queryFn: async () => {
      let query = supabase
        .from("offer_templates")
        .select("*")
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("use_count", { ascending: false });

      if (offerType) {
        query = query.eq("offer_type", offerType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OfferTemplate[];
    },
    enabled: !!organization?.id,
  });
}

export function useOfferTemplate(id: string | null) {
  return useQuery({
    queryKey: ["offer-template", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("offer_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as OfferTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateOfferTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (template: Omit<OfferTemplate, "id" | "user_id" | "organization_id" | "created_at" | "updated_at" | "use_count">) => {
      if (!user || !organization) throw new Error("Not authenticated");

      // If setting as default, unset other defaults of same type
      if (template.is_default) {
        await supabase
          .from("offer_templates")
          .update({ is_default: false })
          .eq("offer_type", template.offer_type)
          .eq("is_default", true);
      }

      const { data, error } = await supabase
        .from("offer_templates")
        .insert({
          ...template,
          user_id: user.id,
          organization_id: organization.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-templates"] });
      toast.success("Template saved successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to save template", { description: error.message });
    },
  });
}

export function useUpdateOfferTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<OfferTemplate>;
    }) => {
      // If setting as default, unset other defaults of same type
      if (updates.is_default && updates.offer_type) {
        await supabase
          .from("offer_templates")
          .update({ is_default: false })
          .eq("offer_type", updates.offer_type)
          .eq("is_default", true)
          .neq("id", id);
      }

      const { data, error } = await supabase
        .from("offer_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-templates"] });
      toast.success("Template updated");
    },
    onError: (error: any) => {
      toast.error("Failed to update template", { description: error.message });
    },
  });
}

export function useDeleteOfferTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("offer_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-templates"] });
      toast.success("Template deleted");
    },
    onError: (error: any) => {
      toast.error("Failed to delete template", { description: error.message });
    },
  });
}

export function useIncrementTemplateUseCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Do manual update
      const { data: current } = await supabase
        .from("offer_templates")
        .select("use_count")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("offer_templates")
        .update({ use_count: (current?.use_count || 0) + 1 })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-templates"] });
    },
  });
}

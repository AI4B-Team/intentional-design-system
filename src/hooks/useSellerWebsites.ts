import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface SellerWebsite {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  domain_verified: boolean | null;
  site_type: string | null;
  company_name: string;
  company_phone: string | null;
  company_email: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  value_props: Json | null;
  process_steps: Json | null;
  testimonials: Json | null;
  about_headline: string | null;
  about_content: string | null;
  faqs: Json | null;
  meta_title: string | null;
  meta_description: string | null;
  form_headline: string | null;
  form_subheadline: string | null;
  form_fields: Json | null;
  form_submit_text: string | null;
  lead_notification_email: string | null;
  lead_notification_sms: string | null;
  auto_respond_email: boolean | null;
  auto_respond_sms: boolean | null;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  status: string | null;
  published_at: string | null;
  total_views: number | null;
  total_submissions: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateWebsiteData {
  name: string;
  slug: string;
  site_type?: string;
  company_name: string;
  company_phone?: string;
  company_email?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_image_url?: string;
  value_props?: Json;
  process_steps?: Json;
  form_fields?: string[];
  form_submit_text?: string;
  lead_notification_email?: string;
  lead_notification_sms?: string;
  auto_respond_email?: boolean;
  auto_respond_sms?: boolean;
  status?: string;
}

export function useSellerWebsites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-websites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_websites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SellerWebsite[];
    },
    enabled: !!user?.id,
  });
}

export function useSellerWebsite(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-website", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("seller_websites")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as SellerWebsite;
    },
    enabled: !!user?.id && !!id,
  });
}

export function useWebsiteStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-websites-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_websites")
        .select("id, status, total_views, total_submissions");

      if (error) throw error;

      const websites = data || [];
      const totalSites = websites.length;
      const published = websites.filter((w) => w.status === "published").length;
      const totalViews = websites.reduce((sum, w) => sum + (w.total_views || 0), 0);
      const totalLeads = websites.reduce((sum, w) => sum + (w.total_submissions || 0), 0);
      const avgConversion = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      return {
        totalSites,
        published,
        totalViews,
        totalLeads,
        avgConversion: avgConversion.toFixed(1),
      };
    },
    enabled: !!user?.id,
  });
}

export function useCreateWebsite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateWebsiteData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: website, error } = await supabase
        .from("seller_websites")
        .insert({
          user_id: user.id,
          ...data,
          form_fields: data.form_fields ? JSON.stringify(data.form_fields) : undefined,
        })
        .select()
        .single();

      if (error) throw error;
      return website as SellerWebsite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-websites"] });
      queryClient.invalidateQueries({ queryKey: ["seller-websites-stats"] });
      toast.success("Website created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create website");
    },
  });
}

export function useUpdateWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWebsiteData> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.form_fields) {
        updateData.form_fields = JSON.stringify(data.form_fields);
      }

      const { data: website, error } = await supabase
        .from("seller_websites")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return website as SellerWebsite;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller-websites"] });
      queryClient.invalidateQueries({ queryKey: ["seller-website", variables.id] });
      toast.success("Website updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update website");
    },
  });
}

export function usePublishWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("seller_websites")
        .update({ 
          status: "published", 
          published_at: new Date().toISOString() 
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SellerWebsite;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["seller-websites"] });
      queryClient.invalidateQueries({ queryKey: ["seller-website", id] });
      toast.success("Website published!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish website");
    },
  });
}

export function useUnpublishWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("seller_websites")
        .update({ status: "paused" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SellerWebsite;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["seller-websites"] });
      queryClient.invalidateQueries({ queryKey: ["seller-website", id] });
      toast.success("Website paused");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to pause website");
    },
  });
}

export function useDuplicateWebsite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Fetch original website
      const { data: original, error: fetchError } = await supabase
        .from("seller_websites")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const { data: duplicate, error } = await supabase
        .from("seller_websites")
        .insert({
          user_id: user.id,
          name: `${original.name} (Copy)`,
          slug: `${original.slug}-copy-${Date.now()}`,
          site_type: original.site_type,
          company_name: original.company_name,
          company_phone: original.company_phone,
          company_email: original.company_email,
          logo_url: original.logo_url,
          primary_color: original.primary_color,
          secondary_color: original.secondary_color,
          accent_color: original.accent_color,
          hero_headline: original.hero_headline,
          hero_subheadline: original.hero_subheadline,
          hero_image_url: original.hero_image_url,
          value_props: original.value_props,
          process_steps: original.process_steps,
          testimonials: original.testimonials,
          about_headline: original.about_headline,
          about_content: original.about_content,
          faqs: original.faqs,
          form_fields: original.form_fields,
          form_submit_text: original.form_submit_text,
          lead_notification_email: original.lead_notification_email,
          auto_respond_email: original.auto_respond_email,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return duplicate as SellerWebsite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-websites"] });
      toast.success("Website duplicated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to duplicate website");
    },
  });
}

export function useDeleteWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("seller_websites")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-websites"] });
      queryClient.invalidateQueries({ queryKey: ["seller-websites-stats"] });
      toast.success("Website deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete website");
    },
  });
}

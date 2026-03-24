import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

export interface ScrapeJob {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  query: string | null;
  sources: string[];
  filters: Record<string, any>;
  schedule_interval: string;
  is_active: boolean;
  is_shared: boolean;
  last_run_at: string | null;
  last_run_results: number;
  total_leads_found: number;
  created_at: string;
  updated_at: string;
}

export interface ScrapedLead {
  id: string;
  scrape_job_id: string | null;
  user_id: string;
  source_url: string | null;
  source_name: string | null;
  title: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  description: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  images: string[] | null;
  is_enriched: boolean;
  is_imported: boolean;
  status: string;
  created_at: string;
}

export function useScrapeJobs() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["scrape-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrape_jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ScrapeJob[];
    },
    enabled: !!user?.id,
  });

  const leadsQuery = useQuery({
    queryKey: ["scraped-leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraped_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as ScrapedLead[];
    },
    enabled: !!user?.id,
  });

  const createJob = useMutation({
    mutationFn: async (job: Partial<ScrapeJob>) => {
      const { data, error } = await supabase
        .from("scrape_jobs")
        .insert({
          user_id: user!.id,
          organization_id: organization?.id,
          name: job.name || "New Search",
          description: job.description,
          query: job.query,
          sources: job.sources || ["craigslist", "facebook"],
          filters: job.filters as any || {},
          schedule_interval: job.schedule_interval || "manual",
          is_active: job.is_active ?? true,
          is_shared: job.is_shared ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ScrapeJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrape-jobs"] });
      toast.success("Search saved");
    },
    onError: (e) => toast.error("Failed to create search: " + e.message),
  });

  const runScrape = useMutation({
    mutationFn: async (params: { query: string; sources?: string[]; jobId?: string }) => {
      const { data, error } = await supabase.functions.invoke("scrape-listings", {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scraped-leads"] });
      queryClient.invalidateQueries({ queryKey: ["scrape-jobs"] });
      toast.success(`Found ${data?.leads_found || 0} leads`);
    },
    onError: (e) => toast.error("Scrape failed: " + e.message),
  });

  const importLead = useMutation({
    mutationFn: async (leadId: string) => {
      // Get the lead
      const { data: lead, error: leadErr } = await supabase
        .from("scraped_leads")
        .select("*")
        .eq("id", leadId)
        .single();
      if (leadErr) throw leadErr;

      // Create property from lead
      const { error: propErr } = await supabase.from("properties").insert({
        user_id: user!.id,
        organization_id: organization?.id,
        address: lead.address || "Unknown",
        city: lead.city,
        state: lead.state,
        zip: lead.zip,
        asking_price: lead.price,
        property_type: lead.property_type,
        beds: lead.bedrooms,
        baths: lead.bathrooms,
        sqft: lead.sqft,
        owner_name: lead.contact_name,
        owner_phone: lead.contact_phone,
        owner_email: lead.contact_email,
        source: `scrape:${lead.source_name}`,
        notes: lead.description,
        status: "new",
      });
      if (propErr) throw propErr;

      // Mark as imported
      await supabase
        .from("scraped_leads")
        .update({ is_imported: true, status: "imported" })
        .eq("id", leadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scraped-leads"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Lead imported to pipeline");
    },
    onError: (e) => toast.error("Failed to import: " + e.message),
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scrape_jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scrape-jobs"] });
      toast.success("Search deleted");
    },
  });

  return {
    jobs: jobsQuery.data || [],
    leads: leadsQuery.data || [],
    isLoadingJobs: jobsQuery.isLoading,
    isLoadingLeads: leadsQuery.isLoading,
    createJob,
    runScrape,
    importLead,
    deleteJob,
  };
}

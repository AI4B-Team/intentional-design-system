
-- Phase 7: Buy Boxes table for Auto-Offer Engine
CREATE TABLE public.buy_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  criteria JSONB DEFAULT '{}'::jsonb,
  offer_formula TEXT DEFAULT 'pct_arv',
  offer_percentage NUMERIC DEFAULT 0.70,
  max_daily_offers INTEGER DEFAULT 10,
  total_offers_sent INTEGER DEFAULT 0,
  total_deals_closed INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add automation_mode to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS automation_mode TEXT DEFAULT 'hybrid';

-- Scrape jobs table for Phase 10
CREATE TABLE public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query TEXT,
  sources TEXT[] DEFAULT '{}',
  filters JSONB DEFAULT '{}'::jsonb,
  schedule_interval TEXT DEFAULT 'manual',
  is_active BOOLEAN DEFAULT true,
  is_shared BOOLEAN DEFAULT false,
  last_run_at TIMESTAMPTZ,
  last_run_results INTEGER DEFAULT 0,
  total_leads_found INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scraped leads table
CREATE TABLE public.scraped_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_job_id UUID REFERENCES public.scrape_jobs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_url TEXT,
  source_name TEXT,
  title TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  price NUMERIC,
  description TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  sqft INTEGER,
  images TEXT[],
  raw_data JSONB,
  enrichment_data JSONB,
  is_enriched BOOLEAN DEFAULT false,
  is_imported BOOLEAN DEFAULT false,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for buy_boxes
ALTER TABLE public.buy_boxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own buy boxes" ON public.buy_boxes FOR ALL TO authenticated
  USING (user_id = auth.uid() OR organization_id = public.get_user_organization())
  WITH CHECK (user_id = auth.uid());

-- RLS for scrape_jobs (shared within org)
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own and shared scrape jobs" ON public.scrape_jobs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (is_shared = true AND organization_id = public.get_user_organization()));
CREATE POLICY "Users can manage own scrape jobs" ON public.scrape_jobs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own scrape jobs" ON public.scrape_jobs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own scrape jobs" ON public.scrape_jobs FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS for scraped_leads
ALTER TABLE public.scraped_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org scraped leads" ON public.scraped_leads FOR ALL TO authenticated
  USING (user_id = auth.uid() OR organization_id = public.get_user_organization())
  WITH CHECK (user_id = auth.uid());

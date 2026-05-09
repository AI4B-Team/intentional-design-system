
-- ============= leads_properties =============
CREATE TABLE public.leads_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  property_id UUID, -- optional link to existing properties table
  source TEXT NOT NULL CHECK (source IN ('auto_detect','manual','d4d_pin','manual_scan')),
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  beds INTEGER,
  baths NUMERIC,
  sqft INTEGER,
  year_built INTEGER,
  asset_class TEXT,
  estimated_value NUMERIC,
  estimated_equity NUMERIC,
  address_hash TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_properties_org ON public.leads_properties(organization_id, created_at DESC);
CREATE INDEX idx_leads_properties_source ON public.leads_properties(organization_id, source);
CREATE INDEX idx_leads_properties_hash ON public.leads_properties(organization_id, address_hash);
ALTER TABLE public.leads_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_properties" ON public.leads_properties FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_properties" ON public.leads_properties FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_properties" ON public.leads_properties FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_properties" ON public.leads_properties FOR DELETE USING (public.is_org_member(organization_id));
CREATE TRIGGER trg_leads_properties_updated BEFORE UPDATE ON public.leads_properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= leads_signals =============
CREATE TABLE public.leads_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  lead_property_id UUID NOT NULL REFERENCES public.leads_properties(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  confidence NUMERIC NOT NULL DEFAULT 0.7,
  source TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_signals_lead ON public.leads_signals(lead_property_id, detected_at DESC);
CREATE INDEX idx_leads_signals_org ON public.leads_signals(organization_id, signal_type);
ALTER TABLE public.leads_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_signals" ON public.leads_signals FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_signals" ON public.leads_signals FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_signals" ON public.leads_signals FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_signals" ON public.leads_signals FOR DELETE USING (public.is_org_member(organization_id));

-- ============= leads_enrichment =============
CREATE TABLE public.leads_enrichment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  lead_property_id UUID NOT NULL REFERENCES public.leads_properties(id) ON DELETE CASCADE,
  owner_name TEXT,
  owner_first_name TEXT,
  owner_last_name TEXT,
  phones JSONB DEFAULT '[]'::jsonb,
  emails JSONB DEFAULT '[]'::jsonb,
  mailing_address TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  is_absentee BOOLEAN,
  ownership_length_years INTEGER,
  enrichment_source TEXT,
  enriched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_enrichment_lead ON public.leads_enrichment(lead_property_id);
ALTER TABLE public.leads_enrichment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_enrichment" ON public.leads_enrichment FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_enrichment" ON public.leads_enrichment FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_enrichment" ON public.leads_enrichment FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_enrichment" ON public.leads_enrichment FOR DELETE USING (public.is_org_member(organization_id));
CREATE TRIGGER trg_leads_enrichment_updated BEFORE UPDATE ON public.leads_enrichment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= leads_scores =============
CREATE TABLE public.leads_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  lead_property_id UUID NOT NULL REFERENCES public.leads_properties(id) ON DELETE CASCADE,
  opportunity_score INTEGER NOT NULL DEFAULT 0 CHECK (opportunity_score BETWEEN 0 AND 100),
  tier TEXT NOT NULL DEFAULT 'cold' CHECK (tier IN ('hot','warm','cold')),
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_scores_lead ON public.leads_scores(lead_property_id, computed_at DESC);
CREATE INDEX idx_leads_scores_org_tier ON public.leads_scores(organization_id, tier, opportunity_score DESC);
ALTER TABLE public.leads_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_scores" ON public.leads_scores FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_scores" ON public.leads_scores FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_scores" ON public.leads_scores FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_scores" ON public.leads_scores FOR DELETE USING (public.is_org_member(organization_id));

-- ============= leads_outreach_log =============
CREATE TABLE public.leads_outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  lead_property_id UUID NOT NULL REFERENCES public.leads_properties(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('sms','mail','call','email')),
  trigger_mode TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_mode IN ('manual','auto')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','failed','cancelled')),
  payload JSONB DEFAULT '{}'::jsonb,
  external_ref TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_outreach_lead ON public.leads_outreach_log(lead_property_id, created_at DESC);
CREATE INDEX idx_leads_outreach_org ON public.leads_outreach_log(organization_id, status, created_at DESC);
ALTER TABLE public.leads_outreach_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_outreach_log" ON public.leads_outreach_log FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_outreach_log" ON public.leads_outreach_log FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_outreach_log" ON public.leads_outreach_log FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_outreach_log" ON public.leads_outreach_log FOR DELETE USING (public.is_org_member(organization_id));
CREATE TRIGGER trg_leads_outreach_updated BEFORE UPDATE ON public.leads_outreach_log FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= leads_scan_jobs =============
CREATE TABLE public.leads_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  job_type TEXT NOT NULL CHECK (job_type IN ('manual','scheduled')),
  signal_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  area JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','cancelled')),
  results_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_scan_jobs_org ON public.leads_scan_jobs(organization_id, created_at DESC);
ALTER TABLE public.leads_scan_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_scan_jobs" ON public.leads_scan_jobs FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_scan_jobs" ON public.leads_scan_jobs FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_scan_jobs" ON public.leads_scan_jobs FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_scan_jobs" ON public.leads_scan_jobs FOR DELETE USING (public.is_org_member(organization_id));
CREATE TRIGGER trg_leads_scan_jobs_updated BEFORE UPDATE ON public.leads_scan_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= leads_scraper_health =============
CREATE TABLE public.leads_scraper_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('healthy','degraded','down','unknown')),
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_reason TEXT,
  records_last_run INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, source_name)
);
CREATE INDEX idx_leads_scraper_health_org ON public.leads_scraper_health(organization_id);
ALTER TABLE public.leads_scraper_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read scraper_health" ON public.leads_scraper_health FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "managers write scraper_health insert" ON public.leads_scraper_health FOR INSERT WITH CHECK (public.is_org_member(organization_id) AND public.user_has_role('manager'));
CREATE POLICY "managers write scraper_health update" ON public.leads_scraper_health FOR UPDATE USING (public.is_org_member(organization_id) AND public.user_has_role('manager'));
CREATE POLICY "managers write scraper_health delete" ON public.leads_scraper_health FOR DELETE USING (public.is_org_member(organization_id) AND public.user_has_role('manager'));
CREATE TRIGGER trg_leads_scraper_health_updated BEFORE UPDATE ON public.leads_scraper_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= leads_pins =============
CREATE TABLE public.leads_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  lead_property_id UUID REFERENCES public.leads_properties(id) ON DELETE SET NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  notes TEXT,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_pins_org ON public.leads_pins(organization_id, pinned_at DESC);
ALTER TABLE public.leads_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read leads_pins" ON public.leads_pins FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "org members insert leads_pins" ON public.leads_pins FOR INSERT WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "org members update leads_pins" ON public.leads_pins FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "org members delete leads_pins" ON public.leads_pins FOR DELETE USING (public.is_org_member(organization_id));

-- ============= automation_settings =============
CREATE TABLE public.automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE,
  auto_detect_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_enrich_hot BOOLEAN NOT NULL DEFAULT true,
  auto_campaigns_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_campaign_score_threshold INTEGER NOT NULL DEFAULT 80,
  daily_campaign_cap INTEGER NOT NULL DEFAULT 50,
  default_campaign_type TEXT NOT NULL DEFAULT 'sms' CHECK (default_campaign_type IN ('sms','mail','call','email')),
  cooldown_days INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read automation_settings" ON public.automation_settings FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "managers insert automation_settings" ON public.automation_settings FOR INSERT WITH CHECK (public.is_org_member(organization_id) AND public.user_has_role('manager'));
CREATE POLICY "managers update automation_settings" ON public.automation_settings FOR UPDATE USING (public.is_org_member(organization_id) AND public.user_has_role('manager'));
CREATE POLICY "managers delete automation_settings" ON public.automation_settings FOR DELETE USING (public.is_org_member(organization_id) AND public.user_has_role('manager'));
CREATE TRIGGER trg_automation_settings_updated BEFORE UPDATE ON public.automation_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

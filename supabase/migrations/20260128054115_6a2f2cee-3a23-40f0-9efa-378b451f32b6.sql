-- =============================================
-- DISPO DEAL WEBSITES SCHEMA
-- Property marketing pages for wholesalers
-- =============================================

-- 1. CASH_BUYERS TABLE (buyer list)
CREATE TABLE public.cash_buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Contact info
  first_name text,
  last_name text,
  full_name text,
  company_name text,
  email text NOT NULL,
  phone text,
  
  -- Location preferences
  markets text[], -- ['Austin, TX', 'San Antonio, TX']
  zip_codes text[], -- specific zips they buy in
  
  -- Buying criteria
  property_types text[] DEFAULT ARRAY['sfh'], -- sfh, multi, condo, land, commercial
  min_price decimal,
  max_price decimal,
  min_arv decimal,
  max_arv decimal,
  min_equity_pct decimal,
  
  -- Preferences
  buying_strategy text[], -- ['flip', 'rental', 'brrrr', 'wholesale']
  condition_preference text[], -- ['turnkey', 'light_rehab', 'heavy_rehab', 'gut']
  can_close_days integer, -- how fast they can close
  funding_type text, -- cash, hard_money, conventional, private
  
  -- Verification
  is_verified boolean DEFAULT false,
  proof_of_funds_url text,
  proof_of_funds_verified boolean DEFAULT false,
  proof_of_funds_amount decimal,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users,
  
  -- Engagement
  deals_viewed integer DEFAULT 0,
  deals_interested integer DEFAULT 0,
  deals_purchased integer DEFAULT 0,
  total_purchase_volume decimal DEFAULT 0,
  last_active_at timestamptz,
  
  -- Communication
  email_opt_in boolean DEFAULT true,
  sms_opt_in boolean DEFAULT false,
  
  -- Rating
  buyer_rating integer, -- 1-5 stars based on experience
  rating_notes text,
  
  -- Tags
  tags text[] DEFAULT '{}',
  
  -- Status
  status text DEFAULT 'active',
  
  -- Source
  source text, -- manual, website, referral, facebook, networking
  source_detail text,
  referred_by uuid REFERENCES public.cash_buyers,
  
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cash_buyers_user ON public.cash_buyers(user_id, status);
CREATE INDEX idx_cash_buyers_org ON public.cash_buyers(organization_id);
CREATE INDEX idx_cash_buyers_email ON public.cash_buyers(user_id, email);
CREATE INDEX idx_cash_buyers_markets ON public.cash_buyers USING gin(markets);
CREATE INDEX idx_cash_buyers_tags ON public.cash_buyers USING gin(tags);

-- 2. DISPO_DEALS TABLE (deals being marketed)
CREATE TABLE public.dispo_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties ON DELETE SET NULL,
  
  -- Deal identity
  title text NOT NULL,
  slug text NOT NULL,
  
  -- Property details
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text,
  county text,
  neighborhood text,
  
  property_type text DEFAULT 'sfh',
  beds integer,
  baths decimal,
  sqft integer,
  lot_sqft integer,
  year_built integer,
  stories integer,
  garage text,
  pool boolean DEFAULT false,
  
  -- Pricing
  asking_price decimal NOT NULL,
  arv decimal,
  repair_estimate decimal,
  
  -- Calculated (auto-updated by trigger)
  equity_amount decimal,
  equity_percentage decimal,
  price_per_sqft decimal,
  
  -- Assignment info
  assignment_fee decimal,
  show_assignment_fee boolean DEFAULT false,
  contract_price decimal,
  
  -- Property description
  description text,
  investment_highlights text[],
  repair_details text,
  
  -- Comps
  comps_summary text,
  comps_data jsonb DEFAULT '[]',
  
  -- Media
  photos jsonb DEFAULT '[]',
  video_url text,
  virtual_tour_url text,
  
  -- Documents
  documents jsonb DEFAULT '[]',
  
  -- Deal terms
  earnest_money_required decimal,
  closing_timeline text,
  financing_allowed text[],
  assignment_or_double boolean DEFAULT true,
  
  -- Status
  status text DEFAULT 'draft',
  
  -- Visibility
  visibility text DEFAULT 'public',
  password_protected boolean DEFAULT false,
  access_password text,
  
  -- Dates
  published_at timestamptz,
  expires_at timestamptz,
  under_contract_at timestamptz,
  sold_at timestamptz,
  
  -- Buyer info (when sold)
  sold_to_buyer_id uuid REFERENCES public.cash_buyers,
  final_sale_price decimal,
  
  -- Stats
  view_count integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  interest_count integer DEFAULT 0,
  inquiry_count integer DEFAULT 0,
  
  -- Notifications
  notify_on_view boolean DEFAULT false,
  notify_on_interest boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_dispo_deals_slug ON public.dispo_deals(user_id, slug);
CREATE INDEX idx_dispo_deals_org ON public.dispo_deals(organization_id);
CREATE INDEX idx_dispo_deals_status ON public.dispo_deals(user_id, status);
CREATE INDEX idx_dispo_deals_city ON public.dispo_deals(city, state, status);
CREATE INDEX idx_dispo_deals_property ON public.dispo_deals(property_id);

-- 3. DEAL_INTERESTS TABLE (buyer interest/inquiries)
CREATE TABLE public.deal_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.dispo_deals ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES public.cash_buyers ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Interest level
  interest_type text NOT NULL,
  
  -- If not registered buyer
  guest_name text,
  guest_email text,
  guest_phone text,
  
  -- Offer details
  offer_amount decimal,
  offer_notes text,
  offer_submitted_at timestamptz,
  
  -- Communication
  message text,
  questions text,
  
  -- Follow-up
  follow_up_status text DEFAULT 'pending',
  follow_up_notes text,
  last_contacted_at timestamptz,
  
  -- Tracking
  source text,
  campaign_id uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_interests_deal ON public.deal_interests(deal_id, interest_type);
CREATE INDEX idx_deal_interests_buyer ON public.deal_interests(buyer_id);
CREATE INDEX idx_deal_interests_org ON public.deal_interests(organization_id);

-- 4. DEAL_VIEWS TABLE (view tracking)
CREATE TABLE public.deal_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.dispo_deals ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES public.cash_buyers,
  
  -- Visitor info
  visitor_id text,
  ip_address text,
  user_agent text,
  
  -- Source tracking
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  -- Engagement
  time_on_page_seconds integer,
  photos_viewed integer,
  documents_accessed boolean DEFAULT false,
  
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_views_deal ON public.deal_views(deal_id, viewed_at DESC);
CREATE INDEX idx_deal_views_buyer ON public.deal_views(buyer_id);

-- 5. DEAL_CAMPAIGNS TABLE (email blasts)
CREATE TABLE public.deal_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  deal_id uuid REFERENCES public.dispo_deals ON DELETE CASCADE NOT NULL,
  
  name text NOT NULL,
  
  -- Email content
  subject text NOT NULL,
  preview_text text,
  email_body text,
  
  -- Recipients
  recipient_filter jsonb DEFAULT '{}',
  recipient_count integer DEFAULT 0,
  recipient_ids uuid[],
  
  -- Schedule
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  
  -- Stats
  emails_sent integer DEFAULT 0,
  emails_delivered integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_clicked integer DEFAULT 0,
  unique_opens integer DEFAULT 0,
  unique_clicks integer DEFAULT 0,
  unsubscribes integer DEFAULT 0,
  
  open_rate decimal,
  click_rate decimal,
  
  -- Results
  interests_generated integer DEFAULT 0,
  offers_received integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_campaigns_deal ON public.deal_campaigns(deal_id);
CREATE INDEX idx_deal_campaigns_user ON public.deal_campaigns(user_id, status);
CREATE INDEX idx_deal_campaigns_org ON public.deal_campaigns(organization_id);

-- 6. DISPO_SETTINGS TABLE (user's dispo configuration)
CREATE TABLE public.dispo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Branding
  company_name text,
  company_logo_url text,
  company_phone text,
  company_email text,
  company_website text,
  
  -- Deal page settings
  default_theme text DEFAULT 'modern',
  primary_color text DEFAULT '#2563EB',
  accent_color text DEFAULT '#10B981',
  
  -- Default deal settings
  default_earnest_money decimal DEFAULT 5000,
  default_closing_timeline text DEFAULT '7-14 days',
  default_financing_allowed text[] DEFAULT ARRAY['cash', 'hard_money'],
  
  -- Buyer registration
  require_registration boolean DEFAULT false,
  require_proof_of_funds boolean DEFAULT false,
  auto_approve_buyers boolean DEFAULT true,
  
  -- Notifications
  notify_new_buyer boolean DEFAULT true,
  notify_deal_view boolean DEFAULT false,
  notify_deal_interest boolean DEFAULT true,
  notify_offer boolean DEFAULT true,
  notification_email text,
  notification_sms text,
  
  -- Email settings
  email_from_name text,
  email_reply_to text,
  email_signature text,
  email_footer_text text,
  
  -- Legal
  disclaimer_text text,
  terms_url text,
  privacy_url text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dispo_settings_org ON public.dispo_settings(organization_id);

-- 7. BUYER_PORTAL_SESSIONS (for buyer authentication)
CREATE TABLE public.buyer_portal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES public.cash_buyers ON DELETE CASCADE NOT NULL,
  
  session_token text NOT NULL UNIQUE,
  
  -- Magic link auth
  magic_link_token text,
  magic_link_expires_at timestamptz,
  
  ip_address text,
  user_agent text,
  
  expires_at timestamptz NOT NULL,
  last_active_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_buyer_sessions_token ON public.buyer_portal_sessions(session_token);
CREATE INDEX idx_buyer_sessions_buyer ON public.buyer_portal_sessions(buyer_id);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.cash_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispo_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_portal_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Cash Buyers policies
CREATE POLICY "Users manage own buyers" ON public.cash_buyers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Org members view org buyers" ON public.cash_buyers
  FOR SELECT USING (
    organization_id IS NOT NULL AND 
    public.is_org_member(organization_id)
  );

-- Dispo Deals policies
CREATE POLICY "Users manage own deals" ON public.dispo_deals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Org members view org deals" ON public.dispo_deals
  FOR SELECT USING (
    organization_id IS NOT NULL AND 
    public.is_org_member(organization_id)
  );

CREATE POLICY "Public view active deals" ON public.dispo_deals
  FOR SELECT USING (status = 'active' AND visibility = 'public');

-- Deal Interests policies
CREATE POLICY "Users manage own interests" ON public.deal_interests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public insert interests" ON public.deal_interests
  FOR INSERT WITH CHECK (true);

-- Deal Views policies
CREATE POLICY "Users view own deal views" ON public.deal_views
  FOR SELECT USING (
    deal_id IN (SELECT id FROM public.dispo_deals WHERE user_id = auth.uid())
  );

CREATE POLICY "Org members view org deal views" ON public.deal_views
  FOR SELECT USING (
    deal_id IN (
      SELECT id FROM public.dispo_deals 
      WHERE organization_id IS NOT NULL AND public.is_org_member(organization_id)
    )
  );

CREATE POLICY "Public insert views" ON public.deal_views
  FOR INSERT WITH CHECK (true);

-- Deal Campaigns policies
CREATE POLICY "Users manage own campaigns" ON public.deal_campaigns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Org members view org campaigns" ON public.deal_campaigns
  FOR SELECT USING (
    organization_id IS NOT NULL AND 
    public.is_org_member(organization_id)
  );

-- Dispo Settings policies
CREATE POLICY "Users manage own settings" ON public.dispo_settings
  FOR ALL USING (auth.uid() = user_id);

-- Buyer Portal Sessions policies
CREATE POLICY "Allow session operations" ON public.buyer_portal_sessions
  FOR ALL USING (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Calculate deal equity (trigger function)
CREATE OR REPLACE FUNCTION public.calculate_deal_equity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.arv IS NOT NULL AND NEW.asking_price IS NOT NULL THEN
    NEW.equity_amount := NEW.arv - NEW.asking_price - COALESCE(NEW.repair_estimate, 0);
    NEW.equity_percentage := CASE 
      WHEN NEW.arv > 0 THEN ROUND(((NEW.equity_amount / NEW.arv) * 100)::numeric, 2)
      ELSE 0 
    END;
  END IF;
  
  IF NEW.sqft IS NOT NULL AND NEW.sqft > 0 THEN
    NEW.price_per_sqft := ROUND((NEW.asking_price / NEW.sqft)::numeric, 2);
  END IF;
  
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_equity_trigger
  BEFORE INSERT OR UPDATE ON public.dispo_deals
  FOR EACH ROW EXECUTE FUNCTION public.calculate_deal_equity();

-- Generate unique slug
CREATE OR REPLACE FUNCTION public.generate_deal_slug(deal_address text, deal_city text, deal_user_id uuid)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(
    deal_address || '-' || deal_city, 
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.dispo_deals WHERE slug = final_slug AND user_id = deal_user_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.auto_generate_deal_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_deal_slug(NEW.address, NEW.city, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER auto_slug_trigger
  BEFORE INSERT ON public.dispo_deals
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_deal_slug();

-- Update cash_buyers updated_at
CREATE TRIGGER update_cash_buyers_updated_at
  BEFORE UPDATE ON public.cash_buyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update deal_interests updated_at
CREATE TRIGGER update_deal_interests_updated_at
  BEFORE UPDATE ON public.deal_interests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update deal_campaigns updated_at
CREATE TRIGGER update_deal_campaigns_updated_at
  BEFORE UPDATE ON public.deal_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update dispo_settings updated_at
CREATE TRIGGER update_dispo_settings_updated_at
  BEFORE UPDATE ON public.dispo_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
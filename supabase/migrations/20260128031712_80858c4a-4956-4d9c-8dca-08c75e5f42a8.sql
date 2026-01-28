-- 1. SELLER_WEBSITES TABLE (each landing page/site)
CREATE TABLE seller_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  
  -- Site identity
  name text NOT NULL,
  slug text NOT NULL,
  
  -- Custom domain (optional)
  custom_domain text,
  domain_verified boolean DEFAULT false,
  domain_ssl_enabled boolean DEFAULT false,
  
  -- Site type
  site_type text DEFAULT 'general' CHECK (site_type IN (
    'general', 'location', 'niche', 'property'
  )),
  
  -- Branding
  company_name text NOT NULL,
  company_phone text,
  company_email text,
  logo_url text,
  favicon_url text,
  
  -- Colors & styling
  primary_color text DEFAULT '#2563EB',
  secondary_color text DEFAULT '#1E40AF',
  accent_color text DEFAULT '#10B981',
  text_color text DEFAULT '#1F2937',
  background_color text DEFAULT '#FFFFFF',
  
  -- Hero section
  hero_headline text DEFAULT 'We Buy Houses Fast For Cash',
  hero_subheadline text DEFAULT 'Get a fair cash offer in 24 hours. No repairs, no fees, no hassle.',
  hero_image_url text,
  hero_video_url text,
  
  -- Value propositions
  value_props jsonb DEFAULT '[
    {"icon": "clock", "title": "Close in 7-14 Days", "description": "We can close on your timeline"},
    {"icon": "dollar", "title": "Cash Offer", "description": "No financing contingencies"},
    {"icon": "tool", "title": "As-Is Condition", "description": "No repairs or cleaning needed"},
    {"icon": "x", "title": "No Fees", "description": "No agent commissions or closing costs"}
  ]',
  
  -- How it works steps
  process_steps jsonb DEFAULT '[
    {"step": 1, "title": "Submit Your Info", "description": "Tell us about your property using our simple form"},
    {"step": 2, "title": "Get Your Offer", "description": "We will analyze your property and present a fair cash offer"},
    {"step": 3, "title": "Close & Get Paid", "description": "Accept the offer and choose your closing date"}
  ]',
  
  -- Testimonials
  testimonials jsonb DEFAULT '[]',
  
  -- About section
  about_headline text DEFAULT 'Why Sell To Us?',
  about_content text,
  about_image_url text,
  team_members jsonb DEFAULT '[]',
  
  -- FAQ
  faqs jsonb DEFAULT '[
    {"question": "How quickly can you close?", "answer": "We can typically close in as little as 7-14 days, or on your timeline."},
    {"question": "Do I need to make repairs?", "answer": "No! We buy houses in any condition. You do not need to fix or clean anything."},
    {"question": "Are there any fees?", "answer": "None. We pay all closing costs. There are no agent commissions or hidden fees."},
    {"question": "How do you determine your offer?", "answer": "We analyze recent sales, property condition, and market trends to make a fair offer."}
  ]',
  
  -- Footer
  footer_text text,
  social_links jsonb DEFAULT '{}',
  
  -- SEO
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_image_url text,
  
  -- Form settings
  form_headline text DEFAULT 'Get Your Cash Offer Today',
  form_subheadline text DEFAULT 'Fill out the form below and we will contact you within 24 hours',
  form_fields jsonb DEFAULT '["address", "name", "phone", "email", "condition", "timeline", "notes"]',
  form_submit_text text DEFAULT 'Get My Cash Offer',
  
  -- Lead handling
  lead_notification_email text,
  lead_notification_sms text,
  auto_respond_email boolean DEFAULT true,
  auto_respond_sms boolean DEFAULT false,
  
  -- Integrations
  google_analytics_id text,
  facebook_pixel_id text,
  google_tag_manager_id text,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'archived')),
  published_at timestamptz,
  
  -- Stats
  total_views integer DEFAULT 0,
  total_submissions integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure unique slugs per user
CREATE UNIQUE INDEX idx_seller_websites_slug ON seller_websites(user_id, slug);
CREATE INDEX idx_seller_websites_org ON seller_websites(organization_id);

-- 2. SELLER_LEADS TABLE (form submissions)
CREATE TABLE seller_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES seller_websites ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  
  -- Contact info
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  
  -- Property info
  property_address text NOT NULL,
  property_city text,
  property_state text,
  property_zip text,
  
  property_type text,
  beds integer,
  baths decimal,
  sqft integer,
  year_built integer,
  lot_size text,
  
  -- Situation
  property_condition text,
  is_owner boolean DEFAULT true,
  is_listed boolean DEFAULT false,
  has_mortgage boolean,
  mortgage_balance decimal,
  asking_price decimal,
  
  -- Motivation
  sell_timeline text,
  reason_selling text,
  
  -- Additional info
  notes text,
  how_heard text,
  
  -- Tracking
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  ip_address text,
  user_agent text,
  
  -- Lead scoring
  motivation_indicators text[] DEFAULT '{}',
  auto_score integer,
  
  -- Status
  status text DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'appointment_set', 
    'offer_made', 'under_contract', 'closed', 'lost', 'spam'
  )),
  
  -- Conversion tracking
  property_id uuid REFERENCES properties ON DELETE SET NULL,
  converted_at timestamptz,
  
  -- Follow-up
  last_contacted_at timestamptz,
  next_followup_at timestamptz,
  followup_notes text,
  
  -- Notifications sent
  auto_email_sent boolean DEFAULT false,
  auto_sms_sent boolean DEFAULT false,
  owner_notified boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_seller_leads_website ON seller_leads(website_id, created_at DESC);
CREATE INDEX idx_seller_leads_status ON seller_leads(user_id, status);
CREATE INDEX idx_seller_leads_org ON seller_leads(organization_id);

-- 3. WEBSITE_PAGES TABLE (additional pages beyond homepage)
CREATE TABLE website_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES seller_websites ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  
  title text NOT NULL,
  slug text NOT NULL,
  
  -- Content
  content text,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Settings
  show_in_nav boolean DEFAULT true,
  nav_order integer DEFAULT 0,
  show_form boolean DEFAULT true,
  
  status text DEFAULT 'published',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_website_pages_slug ON website_pages(website_id, slug);

-- 4. WEBSITE_ANALYTICS TABLE (page view tracking)
CREATE TABLE website_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES seller_websites ON DELETE CASCADE NOT NULL,
  
  -- Event
  event_type text NOT NULL,
  page_url text,
  
  -- Visitor info
  visitor_id text,
  session_id text,
  ip_address text,
  user_agent text,
  referrer text,
  
  -- UTM params
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  -- Device info
  device_type text,
  browser text,
  os text,
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_website_analytics_website ON website_analytics(website_id, created_at DESC);
CREATE INDEX idx_website_analytics_event ON website_analytics(event_type, created_at DESC);

-- 5. AUTO_RESPONDERS TABLE (email/SMS templates)
CREATE TABLE auto_responders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  website_id uuid REFERENCES seller_websites ON DELETE CASCADE,
  
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  
  -- Content
  subject text,
  body text NOT NULL,
  
  -- Settings
  is_active boolean DEFAULT true,
  delay_minutes integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_auto_responders_website ON auto_responders(website_id);

-- 6. RLS POLICIES
ALTER TABLE seller_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_responders ENABLE ROW LEVEL SECURITY;

-- Seller websites policies
CREATE POLICY "Users manage own websites" ON seller_websites
  FOR ALL USING (auth.uid() = user_id OR is_org_member(organization_id));

-- Seller leads policies
CREATE POLICY "Users manage own leads" ON seller_leads
  FOR ALL USING (auth.uid() = user_id OR is_org_member(organization_id));

-- Public can insert leads (for form submissions)
CREATE POLICY "Public can submit leads" ON seller_leads
  FOR INSERT WITH CHECK (true);

-- Website pages policies
CREATE POLICY "Users manage own pages" ON website_pages
  FOR ALL USING (auth.uid() = user_id OR is_org_member(organization_id));

-- Website analytics policies
CREATE POLICY "Users view own analytics" ON website_analytics
  FOR SELECT USING (
    website_id IN (SELECT id FROM seller_websites WHERE user_id = auth.uid() OR is_org_member(organization_id))
  );

CREATE POLICY "Public insert analytics" ON website_analytics
  FOR INSERT WITH CHECK (true);

-- Auto responders policies
CREATE POLICY "Users manage own auto responders" ON auto_responders
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR is_org_member(organization_id));

-- 7. HELPER FUNCTION - Auto-score leads
CREATE OR REPLACE FUNCTION calculate_lead_score(
  p_timeline text,
  p_condition text,
  p_reason text,
  p_has_mortgage boolean,
  p_is_listed boolean
)
RETURNS integer AS $$
DECLARE
  score integer := 500;
BEGIN
  -- Timeline scoring
  CASE p_timeline
    WHEN 'asap' THEN score := score + 200;
    WHEN '30_days' THEN score := score + 150;
    WHEN '60_days' THEN score := score + 100;
    WHEN '90_days' THEN score := score + 50;
    ELSE score := score + 0;
  END CASE;
  
  -- Condition scoring (worse = more motivated)
  CASE p_condition
    WHEN 'poor' THEN score := score + 150;
    WHEN 'needs_work' THEN score := score + 100;
    WHEN 'fair' THEN score := score + 50;
    ELSE score := score + 0;
  END CASE;
  
  -- Reason scoring
  IF p_reason IN ('behind_on_payments', 'foreclosure', 'divorce', 'inherited', 'tax_issues') THEN
    score := score + 100;
  END IF;
  
  -- Mortgage (no mortgage = more equity typically)
  IF p_has_mortgage = false THEN
    score := score + 50;
  END IF;
  
  -- Listed (not listed = less competition)
  IF p_is_listed = false THEN
    score := score + 50;
  END IF;
  
  RETURN LEAST(score, 1000);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- 8. Triggers for updated_at
CREATE TRIGGER update_seller_websites_updated_at
  BEFORE UPDATE ON seller_websites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_leads_updated_at
  BEFORE UPDATE ON seller_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_pages_updated_at
  BEFORE UPDATE ON website_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_responders_updated_at
  BEFORE UPDATE ON auto_responders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
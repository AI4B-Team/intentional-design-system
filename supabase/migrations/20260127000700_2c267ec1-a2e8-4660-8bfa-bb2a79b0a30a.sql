-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  beds INTEGER,
  baths DECIMAL,
  sqft INTEGER,
  lot_size DECIMAL,
  year_built INTEGER,
  property_type TEXT, -- SFH, Duplex, Triplex, Quadplex, Multi, Land, Commercial
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  owner_mailing_address TEXT,
  estimated_value DECIMAL,
  equity_percent DECIMAL,
  mortgage_balance DECIMAL,
  mortgage_payment DECIMAL,
  mortgage_rate DECIMAL,
  motivation_score INTEGER DEFAULT 0, -- 0-1000
  distress_signals JSONB DEFAULT '[]',
  arv DECIMAL,
  arv_confidence TEXT, -- HIGH, MEDIUM, LOW
  repair_estimate DECIMAL,
  repair_details JSONB DEFAULT '[]',
  mao_aggressive DECIMAL,
  mao_standard DECIMAL,
  mao_conservative DECIMAL,
  status TEXT DEFAULT 'new', -- new, contacted, appointment, offer_made, under_contract, closed, dead
  source TEXT, -- d4d, direct_mail, cold_call, agent, wholesaler, marketing, referral
  source_id UUID, -- links to deal_sources if applicable
  velocity_score INTEGER DEFAULT 50, -- 0-100 urgency score
  title_status TEXT, -- unknown, clear, issues
  liens_total DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deal_sources table
CREATE TABLE public.deal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- agent, wholesaler, lender
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  linkedin TEXT,
  source TEXT, -- how you found them: instagram, facebook, reia, referral, cold_outreach
  status TEXT DEFAULT 'cold', -- cold, contacted, responded, active, inactive
  notes TEXT,
  last_contact_date DATE,
  next_followup_date DATE,
  deals_sent INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  total_profit DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key for source_id in properties
ALTER TABLE public.properties
ADD CONSTRAINT properties_source_id_fkey
FOREIGN KEY (source_id) REFERENCES public.deal_sources(id) ON DELETE SET NULL;

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Properties RLS policies
CREATE POLICY "Users can view their own properties"
ON public.properties FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
ON public.properties FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
ON public.properties FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on deal_sources
ALTER TABLE public.deal_sources ENABLE ROW LEVEL SECURITY;

-- Deal sources RLS policies
CREATE POLICY "Users can view their own deal sources"
ON public.deal_sources FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deal sources"
ON public.deal_sources FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal sources"
ON public.deal_sources FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal sources"
ON public.deal_sources FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_sources_updated_at
BEFORE UPDATE ON public.deal_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_source ON public.properties(source);
CREATE INDEX idx_properties_motivation_score ON public.properties(motivation_score DESC);
CREATE INDEX idx_deal_sources_user_id ON public.deal_sources(user_id);
CREATE INDEX idx_deal_sources_type ON public.deal_sources(type);
CREATE INDEX idx_deal_sources_status ON public.deal_sources(status);
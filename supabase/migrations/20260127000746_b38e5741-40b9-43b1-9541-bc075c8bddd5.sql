-- Create comps table
CREATE TABLE public.comps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  comp_address TEXT NOT NULL,
  sale_price DECIMAL,
  sale_date DATE,
  beds INTEGER,
  baths DECIMAL,
  sqft INTEGER,
  distance_miles DECIMAL,
  adjusted_value DECIMAL,
  adjustments JSONB DEFAULT '[]', -- array of {type, amount, reason}
  rating TEXT, -- STRONG, MODERATE, WEAK
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  offer_amount DECIMAL NOT NULL,
  offer_type TEXT, -- opening, counter, final
  sent_via TEXT, -- email, sms, mail, in_person
  sent_date TIMESTAMPTZ,
  response TEXT, -- pending, accepted, rejected, countered, no_response
  counter_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create outreach_log table
CREATE TABLE public.outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL, -- seller, agent, wholesaler, lender, buyer
  target_id UUID NOT NULL, -- property_id or deal_source_id or buyer_id
  channel TEXT NOT NULL, -- sms, email, call, dm, mail, voicemail
  direction TEXT, -- outbound, inbound
  content TEXT,
  status TEXT, -- sent, delivered, opened, responded, failed
  response_content TEXT,
  opted_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  appointment_type TEXT, -- phone, video, in_person
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  assigned_to TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, no_show, rescheduled, cancelled
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create buyers table
CREATE TABLE public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  buy_box JSONB DEFAULT '{}', -- {areas: [], property_types: [], price_min, price_max, condition_preference}
  pof_verified BOOLEAN DEFAULT false,
  avg_close_days INTEGER,
  reliability_score INTEGER DEFAULT 50, -- 0-100
  deals_viewed INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  total_volume DECIMAL DEFAULT 0,
  preferred_contact TEXT, -- sms, email, call
  notes TEXT,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Comps RLS (access through property ownership)
CREATE POLICY "Users can view comps for their properties"
ON public.comps FOR SELECT
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert comps for their properties"
ON public.comps FOR INSERT
TO authenticated
WITH CHECK (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can update comps for their properties"
ON public.comps FOR UPDATE
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete comps for their properties"
ON public.comps FOR DELETE
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- Offers RLS (access through property ownership)
CREATE POLICY "Users can view offers for their properties"
ON public.offers FOR SELECT
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert offers for their properties"
ON public.offers FOR INSERT
TO authenticated
WITH CHECK (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can update offers for their properties"
ON public.offers FOR UPDATE
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete offers for their properties"
ON public.offers FOR DELETE
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- Outreach log RLS (user_id based)
CREATE POLICY "Users can view their own outreach logs"
ON public.outreach_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outreach logs"
ON public.outreach_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outreach logs"
ON public.outreach_log FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outreach logs"
ON public.outreach_log FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Appointments RLS (access through property ownership)
CREATE POLICY "Users can view appointments for their properties"
ON public.appointments FOR SELECT
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert appointments for their properties"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can update appointments for their properties"
ON public.appointments FOR UPDATE
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete appointments for their properties"
ON public.appointments FOR DELETE
TO authenticated
USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- Buyers RLS (user_id based)
CREATE POLICY "Users can view their own buyers"
ON public.buyers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buyers"
ON public.buyers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyers"
ON public.buyers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buyers"
ON public.buyers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add updated_at trigger to buyers table
CREATE TRIGGER update_buyers_updated_at
BEFORE UPDATE ON public.buyers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_comps_property_id ON public.comps(property_id);
CREATE INDEX idx_offers_property_id ON public.offers(property_id);
CREATE INDEX idx_outreach_log_user_id ON public.outreach_log(user_id);
CREATE INDEX idx_outreach_log_target ON public.outreach_log(target_type, target_id);
CREATE INDEX idx_appointments_property_id ON public.appointments(property_id);
CREATE INDEX idx_appointments_scheduled_time ON public.appointments(scheduled_time);
CREATE INDEX idx_buyers_user_id ON public.buyers(user_id);
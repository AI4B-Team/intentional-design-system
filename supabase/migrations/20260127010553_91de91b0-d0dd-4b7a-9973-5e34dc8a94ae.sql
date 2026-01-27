-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'agent_outreach',
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Target criteria (for future API integration)
  target_criteria JSONB DEFAULT '{}',
  
  -- Offer settings
  offer_formula_type TEXT DEFAULT 'percentage',
  offer_percentage DECIMAL DEFAULT 65,
  offer_fixed_discount DECIMAL,
  earnest_money DECIMAL DEFAULT 5000,
  include_earnest_money BOOLEAN DEFAULT true,
  closing_timeline TEXT DEFAULT '21 days',
  
  -- Message template
  email_subject TEXT,
  email_body TEXT,
  
  -- Stats (denormalized for performance)
  properties_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  responded_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create campaign_properties table
CREATE TABLE public.campaign_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Property info (may or may not link to existing property)
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  
  -- External property data
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  list_price DECIMAL,
  days_on_market INTEGER,
  
  -- Agent info
  agent_name TEXT,
  agent_email TEXT,
  agent_phone TEXT,
  brokerage TEXT,
  
  -- Calculated offer
  offer_amount DECIMAL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  response_type TEXT,
  response_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_properties ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = user_id);

-- Campaign properties policies
CREATE POLICY "Users can view their own campaign properties"
ON public.campaign_properties FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaign properties"
ON public.campaign_properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign properties"
ON public.campaign_properties FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign properties"
ON public.campaign_properties FOR DELETE
USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_properties_updated_at
BEFORE UPDATE ON public.campaign_properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_properties_campaign_id ON public.campaign_properties(campaign_id);
CREATE INDEX idx_campaign_properties_status ON public.campaign_properties(status);
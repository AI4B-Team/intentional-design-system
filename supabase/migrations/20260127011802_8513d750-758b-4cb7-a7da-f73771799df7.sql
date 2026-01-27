-- Create marketplace_lenders table (external lenders in the marketplace)
CREATE TABLE public.marketplace_lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  logo_url TEXT,
  lender_type TEXT NOT NULL, -- hard_money, dscr, private, transactional, emd
  min_loan_amount DECIMAL,
  max_loan_amount DECIMAL,
  rate_range_min DECIMAL,
  rate_range_max DECIMAL,
  points_range_min DECIMAL,
  points_range_max DECIMAL,
  max_ltv DECIMAL,
  max_arv_ltv DECIMAL,
  min_credit_score INTEGER,
  property_types TEXT[] DEFAULT '{}',
  states_served TEXT[] DEFAULT '{}',
  loan_purposes TEXT[] DEFAULT '{}',
  typical_funding_days INTEGER,
  prepayment_penalty BOOLEAN DEFAULT false,
  description TEXT,
  application_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create funding_requests table
CREATE TABLE public.funding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL, -- purchase, refinance, bridge, emd, transactional
  loan_amount_requested DECIMAL,
  purpose TEXT,
  property_value DECIMAL,
  arv DECIMAL,
  purchase_price DECIMAL,
  rehab_budget DECIMAL,
  exit_strategy TEXT,
  timeline_needed TEXT, -- asap, 1_week, 2_weeks, 30_days
  credit_score_range TEXT, -- excellent, good, fair, poor
  experience_level TEXT, -- first_deal, 1_to_5, 6_to_20, 20_plus
  status TEXT DEFAULT 'draft', -- draft, submitted, reviewing, approved, funded, declined, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create funding_submissions table (tracks lender responses)
CREATE TABLE public.funding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_request_id UUID NOT NULL REFERENCES public.funding_requests(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.marketplace_lenders(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'submitted', -- submitted, under_review, approved, declined, expired
  response_at TIMESTAMP WITH TIME ZONE,
  offered_amount DECIMAL,
  offered_rate DECIMAL,
  offered_points DECIMAL,
  offered_term INTEGER,
  conditions TEXT,
  expiration_date DATE,
  selected BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_submissions ENABLE ROW LEVEL SECURITY;

-- Marketplace lenders are publicly viewable (active ones)
CREATE POLICY "Anyone can view active marketplace lenders"
ON public.marketplace_lenders
FOR SELECT
USING (is_active = true);

-- Funding requests RLS - users can only access their own
CREATE POLICY "Users can view their own funding requests"
ON public.funding_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funding requests"
ON public.funding_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funding requests"
ON public.funding_requests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funding requests"
ON public.funding_requests
FOR DELETE
USING (auth.uid() = user_id);

-- Funding submissions RLS - users can view submissions for their requests
CREATE POLICY "Users can view submissions for their requests"
ON public.funding_submissions
FOR SELECT
USING (
  funding_request_id IN (
    SELECT id FROM public.funding_requests WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create submissions for their requests"
ON public.funding_submissions
FOR INSERT
WITH CHECK (
  funding_request_id IN (
    SELECT id FROM public.funding_requests WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update submissions for their requests"
ON public.funding_submissions
FOR UPDATE
USING (
  funding_request_id IN (
    SELECT id FROM public.funding_requests WHERE user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_funding_requests_user_id ON public.funding_requests(user_id);
CREATE INDEX idx_funding_requests_status ON public.funding_requests(status);
CREATE INDEX idx_funding_submissions_request_id ON public.funding_submissions(funding_request_id);
CREATE INDEX idx_marketplace_lenders_type ON public.marketplace_lenders(lender_type);
CREATE INDEX idx_marketplace_lenders_active ON public.marketplace_lenders(is_active);

-- Add triggers for updated_at
CREATE TRIGGER update_funding_requests_updated_at
BEFORE UPDATE ON public.funding_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funding_submissions_updated_at
BEFORE UPDATE ON public.funding_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
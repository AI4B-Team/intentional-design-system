-- Create proof_of_funds table for managing POF documents
CREATE TABLE public.proof_of_funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  expiration_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  lender_name TEXT,
  lender_contact TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_templates table for saving offer configurations
CREATE TABLE public.offer_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('cash', 'subject_to', 'seller_financing', 'hybrid', 'novation', 'listing', 'referral')),
  market_type TEXT DEFAULT 'off_market' CHECK (market_type IN ('on_market', 'off_market')),
  document_type TEXT DEFAULT 'loi' CHECK (document_type IN ('loi', 'purchase_agreement', 'both')),
  
  -- Offer Terms (stored as JSONB for flexibility)
  terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Template content
  email_subject TEXT,
  email_body TEXT,
  email_signature TEXT,
  sms_body TEXT,
  loi_content TEXT,
  
  -- Flags
  include_pof BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for POF expiration alerts
CREATE INDEX idx_pof_expiration ON public.proof_of_funds(expiration_date, is_active);
CREATE INDEX idx_pof_user ON public.proof_of_funds(user_id, organization_id);

-- Create index for offer templates
CREATE INDEX idx_offer_templates_user ON public.offer_templates(user_id, organization_id);
CREATE INDEX idx_offer_templates_type ON public.offer_templates(offer_type);

-- Enable RLS
ALTER TABLE public.proof_of_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proof_of_funds
CREATE POLICY "Users can view their org POF" 
ON public.proof_of_funds 
FOR SELECT 
USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can create POF" 
ON public.proof_of_funds 
FOR INSERT 
WITH CHECK (organization_id = public.get_user_organization());

CREATE POLICY "Users can update their org POF" 
ON public.proof_of_funds 
FOR UPDATE 
USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can delete their org POF" 
ON public.proof_of_funds 
FOR DELETE 
USING (organization_id = public.get_user_organization());

-- RLS Policies for offer_templates
CREATE POLICY "Users can view their org offer templates" 
ON public.offer_templates 
FOR SELECT 
USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can create offer templates" 
ON public.offer_templates 
FOR INSERT 
WITH CHECK (organization_id = public.get_user_organization());

CREATE POLICY "Users can update their org offer templates" 
ON public.offer_templates 
FOR UPDATE 
USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can delete their org offer templates" 
ON public.offer_templates 
FOR DELETE 
USING (organization_id = public.get_user_organization());

-- Function to get POFs expiring soon (for alerts)
CREATE OR REPLACE FUNCTION public.get_expiring_pofs(days_ahead INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  organization_id UUID,
  file_name TEXT,
  expiration_date DATE,
  amount DECIMAL,
  lender_name TEXT,
  days_until_expiry INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pof.id,
    pof.user_id,
    pof.organization_id,
    pof.file_name,
    pof.expiration_date,
    pof.amount,
    pof.lender_name,
    (pof.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM public.proof_of_funds pof
  WHERE pof.organization_id = public.get_user_organization()
    AND pof.is_active = true
    AND pof.expiration_date <= (CURRENT_DATE + days_ahead)
    AND pof.expiration_date >= CURRENT_DATE
  ORDER BY pof.expiration_date ASC;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_proof_of_funds_updated_at
BEFORE UPDATE ON public.proof_of_funds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offer_templates_updated_at
BEFORE UPDATE ON public.offer_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add lending_criteria column to deal_sources
ALTER TABLE public.deal_sources
ADD COLUMN lending_criteria jsonb DEFAULT NULL;

-- Create lender_loans table
CREATE TABLE public.lender_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lender_id UUID NOT NULL REFERENCES public.deal_sources(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  loan_amount DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  term_months INTEGER NOT NULL,
  points DECIMAL DEFAULT 0,
  ltv_at_funding DECIMAL,
  funding_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_payments_made DECIMAL DEFAULT 0,
  total_interest_paid DECIMAL DEFAULT 0,
  payoff_date DATE,
  payoff_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lender_loans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own lender loans"
ON public.lender_loans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lender loans"
ON public.lender_loans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lender loans"
ON public.lender_loans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lender loans"
ON public.lender_loans
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_lender_loans_updated_at
BEFORE UPDATE ON public.lender_loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_lender_loans_lender_id ON public.lender_loans(lender_id);
CREATE INDEX idx_lender_loans_property_id ON public.lender_loans(property_id);
CREATE INDEX idx_lender_loans_status ON public.lender_loans(status);
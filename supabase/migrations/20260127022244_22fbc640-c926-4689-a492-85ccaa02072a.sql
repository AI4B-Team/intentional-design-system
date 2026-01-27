-- Create rent_comps table
CREATE TABLE public.rent_comps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  comp_address TEXT NOT NULL,
  rent_amount DECIMAL,
  beds INTEGER,
  baths DECIMAL,
  sqft INTEGER,
  distance_miles DECIMAL,
  source TEXT DEFAULT 'manual',
  listed_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

-- Add rent columns to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS estimated_rent DECIMAL,
ADD COLUMN IF NOT EXISTS rent_confidence TEXT,
ADD COLUMN IF NOT EXISTS rent_data_source TEXT;

-- Create portfolio_properties table for user's own rentals
CREATE TABLE public.portfolio_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  monthly_rent DECIMAL,
  beds INTEGER,
  baths DECIMAL,
  sqft INTEGER,
  property_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rent_comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_properties ENABLE ROW LEVEL SECURITY;

-- Rent comps policies
CREATE POLICY "Users can view rent comps for their properties"
ON public.rent_comps FOR SELECT
USING (
  property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Users can insert rent comps"
ON public.rent_comps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their rent comps"
ON public.rent_comps FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their rent comps"
ON public.rent_comps FOR DELETE
USING (auth.uid() = user_id);

-- Portfolio properties policies
CREATE POLICY "Users can view their portfolio properties"
ON public.portfolio_properties FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert portfolio properties"
ON public.portfolio_properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their portfolio properties"
ON public.portfolio_properties FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their portfolio properties"
ON public.portfolio_properties FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for portfolio_properties updated_at
CREATE TRIGGER update_portfolio_properties_updated_at
BEFORE UPDATE ON public.portfolio_properties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
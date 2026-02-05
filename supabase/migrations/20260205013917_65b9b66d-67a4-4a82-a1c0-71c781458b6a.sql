-- Create table to store comp search runs
CREATE TABLE public.comp_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  subject_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  subject_address TEXT NOT NULL,
  subject_city TEXT,
  subject_state TEXT,
  subject_zip TEXT,
  search_params JSONB,
  comps_found INTEGER DEFAULT 0,
  avg_price_per_sqft NUMERIC,
  avg_sale_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comp_searches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their org comp searches"
ON public.comp_searches
FOR SELECT
USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can insert comp searches"
ON public.comp_searches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comp searches"
ON public.comp_searches
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comp searches"
ON public.comp_searches
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_comp_searches_subject_address ON public.comp_searches(subject_address);
CREATE INDEX idx_comp_searches_user_id ON public.comp_searches(user_id);
CREATE INDEX idx_comp_searches_org_id ON public.comp_searches(organization_id);

-- Trigger for updated_at
CREATE TRIGGER update_comp_searches_updated_at
BEFORE UPDATE ON public.comp_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
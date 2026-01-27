-- Create contractors table
CREATE TABLE public.contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  specialties TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  quality_rating DECIMAL(2,1) DEFAULT 0,
  reliability_rating DECIMAL(2,1) DEFAULT 0,
  communication_rating DECIMAL(2,1) DEFAULT 0,
  overall_rating DECIMAL(2,1) DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  avg_bid_accuracy DECIMAL(5,2) DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 0,
  license_number TEXT,
  license_verified BOOLEAN DEFAULT false,
  insurance_verified BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  scope_of_work TEXT,
  scope_items JSONB DEFAULT '[]',
  bid_amount DECIMAL(12,2),
  timeline_days INTEGER,
  valid_until DATE,
  status TEXT DEFAULT 'requested',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS policies for contractors
CREATE POLICY "Users can view their own contractors"
ON public.contractors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contractors"
ON public.contractors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contractors"
ON public.contractors FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contractors"
ON public.contractors FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for bids
CREATE POLICY "Users can view their own bids"
ON public.bids FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bids"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bids"
ON public.bids FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bids"
ON public.bids FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_contractors_user_id ON public.contractors(user_id);
CREATE INDEX idx_contractors_status ON public.contractors(status);
CREATE INDEX idx_contractors_specialties ON public.contractors USING GIN(specialties);
CREATE INDEX idx_bids_property_id ON public.bids(property_id);
CREATE INDEX idx_bids_contractor_id ON public.bids(contractor_id);
CREATE INDEX idx_bids_status ON public.bids(status);

-- Add trigger for updated_at
CREATE TRIGGER update_contractors_updated_at
BEFORE UPDATE ON public.contractors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
BEFORE UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
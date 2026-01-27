-- Create deal_submissions table for tracking submissions
CREATE TABLE public.deal_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  deal_source_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_phone TEXT NOT NULL,
  submitter_company TEXT,
  submitter_type TEXT,
  referral_source TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  response_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies - public can insert, authenticated users can view/update their submissions
CREATE POLICY "Anyone can submit deals"
ON public.deal_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all submissions"
ON public.deal_submissions
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update submissions"
ON public.deal_submissions
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_deal_submissions_updated_at
BEFORE UPDATE ON public.deal_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true);

-- Storage policies for property photos
CREATE POLICY "Anyone can upload property photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Property photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-photos');

-- Allow public to create properties (for deal submissions)
CREATE POLICY "Anyone can submit properties via deal form"
ON public.properties
FOR INSERT
WITH CHECK (source = 'deal_submission');

-- Allow public to create deal sources (for new submitters)
CREATE POLICY "Anyone can create deal sources via submission"
ON public.deal_sources
FOR INSERT
WITH CHECK (source = 'deal_submission');
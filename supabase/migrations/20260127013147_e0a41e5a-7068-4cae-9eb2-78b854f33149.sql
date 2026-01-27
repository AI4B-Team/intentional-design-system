-- Create title_reports table for pre-offer title research
CREATE TABLE public.title_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'preliminary',
  ordered_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT DEFAULT 'manual',
  cost DECIMAL,
  report_url TEXT,
  summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on property_id for faster lookups
CREATE INDEX idx_title_reports_property_id ON public.title_reports(property_id);
CREATE INDEX idx_title_reports_user_id ON public.title_reports(user_id);

-- Enable RLS
ALTER TABLE public.title_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own title reports
CREATE POLICY "Users can view their own title reports"
  ON public.title_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own title reports"
  ON public.title_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own title reports"
  ON public.title_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own title reports"
  ON public.title_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_title_reports_updated_at
  BEFORE UPDATE ON public.title_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
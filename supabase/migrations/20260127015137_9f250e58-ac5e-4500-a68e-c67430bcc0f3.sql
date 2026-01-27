-- Create offer_deliveries table
CREATE TABLE public.offer_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'mail')),
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_address TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  tracking_id TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create offer_followups table
CREATE TABLE public.offer_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled')),
  sent_at TIMESTAMPTZ,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.offer_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_followups ENABLE ROW LEVEL SECURITY;

-- RLS policies for offer_deliveries
CREATE POLICY "Users can view their own offer deliveries"
  ON public.offer_deliveries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offer deliveries"
  ON public.offer_deliveries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offer deliveries"
  ON public.offer_deliveries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offer deliveries"
  ON public.offer_deliveries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for offer_followups
CREATE POLICY "Users can view their own offer followups"
  ON public.offer_followups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offer followups"
  ON public.offer_followups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offer followups"
  ON public.offer_followups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offer followups"
  ON public.offer_followups FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_offer_deliveries_offer_id ON public.offer_deliveries(offer_id);
CREATE INDEX idx_offer_deliveries_property_id ON public.offer_deliveries(property_id);
CREATE INDEX idx_offer_deliveries_status ON public.offer_deliveries(status);
CREATE INDEX idx_offer_followups_offer_id ON public.offer_followups(offer_id);
CREATE INDEX idx_offer_followups_status ON public.offer_followups(status);
CREATE INDEX idx_offer_followups_scheduled_for ON public.offer_followups(scheduled_for);
CREATE TABLE public.scheduled_ai_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid,
  phone_number text NOT NULL,
  contact_name text,
  property_address text,
  property_id uuid,
  call_after timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_ai_calls_due
  ON public.scheduled_ai_calls (call_after)
  WHERE status = 'pending';

CREATE INDEX idx_scheduled_ai_calls_org
  ON public.scheduled_ai_calls (organization_id);

GRANT SELECT ON public.scheduled_ai_calls TO authenticated;
GRANT ALL ON public.scheduled_ai_calls TO service_role;

ALTER TABLE public.scheduled_ai_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their scheduled calls"
  ON public.scheduled_ai_calls
  FOR SELECT
  TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "Service role manages scheduled calls"
  ON public.scheduled_ai_calls
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_scheduled_ai_calls_updated_at
  BEFORE UPDATE ON public.scheduled_ai_calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
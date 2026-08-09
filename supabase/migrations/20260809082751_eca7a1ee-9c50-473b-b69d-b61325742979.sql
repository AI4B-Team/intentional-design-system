ALTER TABLE public.app_family_events
  ADD COLUMN IF NOT EXISTS retry_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retry_at timestamptz;

CREATE INDEX IF NOT EXISTS app_family_events_outbound_retry_idx
  ON public.app_family_events (organization_id, direction, created_at DESC);
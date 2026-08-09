ALTER TABLE public.app_family_events
  ADD COLUMN IF NOT EXISTS dead_lettered_at timestamptz;

CREATE INDEX IF NOT EXISTS app_family_events_dead_lettered_idx
  ON public.app_family_events (organization_id, dead_lettered_at DESC)
  WHERE dead_lettered_at IS NOT NULL;
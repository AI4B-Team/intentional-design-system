ALTER TABLE public.app_family_events
  ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'inbound',
  ADD COLUMN IF NOT EXISTS delivery jsonb;

ALTER TABLE public.app_family_events
  DROP CONSTRAINT IF EXISTS app_family_events_direction_check;
ALTER TABLE public.app_family_events
  ADD CONSTRAINT app_family_events_direction_check CHECK (direction IN ('inbound','outbound'));

UPDATE public.app_family_events SET direction = 'outbound' WHERE app_slug = 'real-elite' AND direction = 'inbound';

CREATE INDEX IF NOT EXISTS app_family_events_org_created_idx
  ON public.app_family_events (organization_id, created_at DESC);
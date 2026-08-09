CREATE UNIQUE INDEX IF NOT EXISTS app_family_events_remote_unique
  ON public.app_family_events (organization_id, app_slug, remote_event_id)
  WHERE remote_event_id IS NOT NULL;
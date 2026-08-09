ALTER TABLE public.app_family_events REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_family_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
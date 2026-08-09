ALTER TABLE public.org_app_links
  ADD COLUMN IF NOT EXISTS last_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_check_passed integer,
  ADD COLUMN IF NOT EXISTS last_check_total integer,
  ADD COLUMN IF NOT EXISTS last_check_details jsonb;
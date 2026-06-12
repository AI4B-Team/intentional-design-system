
-- Extend organizations with welcome wizard fields
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS llc_name text,
  ADD COLUMN IF NOT EXISTS ein text,
  ADD COLUMN IF NOT EXISTS signer_name text,
  ADD COLUMN IF NOT EXISTS signer_title text,
  ADD COLUMN IF NOT EXISTS signature_url text,
  ADD COLUMN IF NOT EXISTS twilio_phone_number text,
  ADD COLUMN IF NOT EXISTS twilio_phone_sid text,
  ADD COLUMN IF NOT EXISTS business_hours_start text,
  ADD COLUMN IF NOT EXISTS business_hours_end text,
  ADD COLUMN IF NOT EXISTS welcome_completed_at timestamptz;

-- Storage policies for signatures and welcome-docs buckets
-- (buckets themselves created via storage_create_bucket tool)

CREATE POLICY "Users manage their own signatures"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'signatures' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'signatures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage their own welcome docs"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'welcome-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'welcome-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

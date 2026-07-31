-- 1. deal_submissions: scope to owning organization / property owner
DROP POLICY IF EXISTS "Authenticated users can view all submissions" ON public.deal_submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.deal_submissions;

CREATE POLICY "Org members can view their submissions"
ON public.deal_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = deal_submissions.property_id
      AND (
        p.user_id = auth.uid()
        OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id))
      )
  )
);

CREATE POLICY "Org members can update their submissions"
ON public.deal_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = deal_submissions.property_id
      AND (
        p.user_id = auth.uid()
        OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = deal_submissions.property_id
      AND (
        p.user_id = auth.uid()
        OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id))
      )
  )
);

-- 2. Deterministic organization lookup
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  ORDER BY joined_at DESC NULLS LAST, organization_id
  LIMIT 1;
$function$;

-- 3. Storage: remove public read on list-uploads
DROP POLICY IF EXISTS "Public read access for list processing" ON storage.objects;
DROP POLICY IF EXISTS "Service can read all list files" ON storage.objects;

-- 4. Storage: remove public read on voice-recordings, scope to owner folder
DROP POLICY IF EXISTS "Anyone can read voice recordings" ON storage.objects;
CREATE POLICY "Users can read own voice recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can upload voice recordings" ON storage.objects;
CREATE POLICY "Users can upload own voice recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Storage: property-photos uploads require auth + own folder
DROP POLICY IF EXISTS "Anyone can upload property photos" ON storage.objects;
CREATE POLICY "Users can upload property photos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. buyer_portal_sessions: service-role only (edge function handles access)
DROP POLICY IF EXISTS "Allow session operations" ON public.buyer_portal_sessions;
REVOKE ALL ON public.buyer_portal_sessions FROM anon, authenticated;
GRANT ALL ON public.buyer_portal_sessions TO service_role;
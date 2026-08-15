DROP POLICY IF EXISTS "Anyone can submit properties via deal form" ON public.properties;
DROP POLICY IF EXISTS "Anyone can create deal sources via submission" ON public.deal_sources;
DROP POLICY IF EXISTS "Anyone can submit deals" ON public.deal_submissions;

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_website text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_billing_email text DEFAULT NULL
)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org public.organizations;
  v_slug text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF coalesce(btrim(p_name), '') = '' THEN
    RAISE EXCEPTION 'Workspace name is required';
  END IF;

  v_slug := coalesce(nullif(btrim(p_slug), ''), 'workspace') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

  INSERT INTO public.organizations (name, slug, website, phone, billing_email)
  VALUES (btrim(p_name), v_slug, nullif(btrim(coalesce(p_website, '')), ''), nullif(btrim(coalesce(p_phone, '')), ''), nullif(btrim(coalesce(p_billing_email, '')), ''))
  RETURNING * INTO v_org;

  INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
  VALUES (v_org.id, auth.uid(), 'owner', 'active', now());

  RETURN v_org;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization_with_owner(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(text, text, text, text, text) TO authenticated;

DROP POLICY IF EXISTS "Users can insert members" ON public.organization_members;
CREATE POLICY "Owners and admins can insert members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT om.organization_id FROM public.organization_members om
    WHERE om.user_id = auth.uid() AND om.status = 'active' AND om.role = ANY (ARRAY['owner'::org_role, 'admin'::org_role])
  )
);
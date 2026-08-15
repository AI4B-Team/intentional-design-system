GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_invites TO authenticated;
GRANT ALL ON public.organization_invites TO service_role;

DROP POLICY IF EXISTS "Users can view invites for their organization" ON public.organization_invites;
CREATE POLICY "Users can view invites for their organization"
ON public.organization_invites
FOR SELECT
TO authenticated
USING (
  public.is_org_member(organization_id)
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
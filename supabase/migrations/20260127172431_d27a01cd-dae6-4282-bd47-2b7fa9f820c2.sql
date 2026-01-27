
-- Fix the overly permissive organization INSERT policy
DROP POLICY IF EXISTS "Anyone can create an organization" ON public.organizations;

CREATE POLICY "Authenticated users can create an organization"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Also need to allow users to add themselves as owner when creating an org
DROP POLICY IF EXISTS "Admins and owners can insert members" ON public.organization_members;

CREATE POLICY "Users can insert members"
ON public.organization_members FOR INSERT
WITH CHECK (
  -- Allow admins/owners to add members
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
  -- OR allow first member (owner) when org has no members yet
  OR (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role = 'owner'
    AND NOT EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organization_members.organization_id
    )
  )
);

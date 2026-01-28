-- Drop and recreate the INSERT policy for organization_members with correct logic
DROP POLICY IF EXISTS "Users can insert members" ON organization_members;

CREATE POLICY "Users can insert members"
ON organization_members
FOR INSERT
WITH CHECK (
  -- Existing admins/owners can add members to their org
  (organization_id IN (
    SELECT om.organization_id
    FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role = ANY (ARRAY['owner'::org_role, 'admin'::org_role])
  ))
  OR
  -- Allow self-insert as owner for a NEW organization (no existing members for that org)
  (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role = 'owner'::org_role
    AND NOT EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
    )
  )
);
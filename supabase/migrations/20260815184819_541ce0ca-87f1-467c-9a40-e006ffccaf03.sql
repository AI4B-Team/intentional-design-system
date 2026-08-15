DROP POLICY IF EXISTS "Workspace members manage deal_interests" ON public.deal_interests;
CREATE POLICY "Workspace members manage deal_interests"
ON public.deal_interests
FOR ALL
TO authenticated
USING (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
WITH CHECK (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()));

DROP POLICY IF EXISTS "Workspace members manage renovation_presets" ON public.renovation_presets;
CREATE POLICY "Workspace members manage renovation_presets"
ON public.renovation_presets
FOR ALL
TO authenticated
USING (
  is_system = false
  AND organization_id IS NOT NULL
  AND organization_id = ANY (public.user_org_ids())
)
WITH CHECK (
  is_system = false
  AND organization_id IS NOT NULL
  AND organization_id = ANY (public.user_org_ids())
);
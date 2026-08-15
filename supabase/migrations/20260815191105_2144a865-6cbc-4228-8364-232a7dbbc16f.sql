ALTER TABLE public.jv_opportunities
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS jv_opportunities_organization_id_idx ON public.jv_opportunities(organization_id);

UPDATE public.jv_opportunities o
SET organization_id = p.organization_id
FROM public.jv_profiles p
WHERE o.organization_id IS NULL AND p.user_id = o.user_id AND p.organization_id IS NOT NULL;

DROP POLICY IF EXISTS "Users can view public opportunities" ON public.jv_opportunities;
CREATE POLICY "Users can view public opportunities"
ON public.jv_opportunities FOR SELECT
USING (
  visibility = 'public'
  OR auth.uid() = user_id
  OR (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
);

DROP POLICY IF EXISTS "Users can update their own opportunities" ON public.jv_opportunities;
CREATE POLICY "Users can update their own opportunities"
ON public.jv_opportunities FOR UPDATE
USING (
  auth.uid() = user_id
  OR (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
)
WITH CHECK (
  auth.uid() = user_id
  OR (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
);

DROP POLICY IF EXISTS "Users can delete their own opportunities" ON public.jv_opportunities;
CREATE POLICY "Users can delete their own opportunities"
ON public.jv_opportunities FOR DELETE
USING (
  auth.uid() = user_id
  OR (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
);
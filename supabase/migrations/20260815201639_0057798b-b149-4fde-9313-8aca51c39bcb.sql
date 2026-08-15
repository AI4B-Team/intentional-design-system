DROP POLICY IF EXISTS "Users can view all user achievements" ON public.user_achievements;

CREATE POLICY "Users can view own and teammate achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.user_id = public.user_achievements.user_id
      AND m.organization_id = ANY (public.user_org_ids())
  )
);

DROP POLICY IF EXISTS "Users can insert own checklist items" ON public.transaction_checklist;

CREATE POLICY "Users can insert own checklist items"
ON public.transaction_checklist
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND organization_id = ANY (public.user_org_ids())
  AND (
    deal_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.property_transactions t
      WHERE t.id::text = public.transaction_checklist.deal_id
        AND (t.organization_id = ANY (public.user_org_ids()) OR t.user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id::text = public.transaction_checklist.deal_id
        AND (p.organization_id = ANY (public.user_org_ids()) OR p.user_id = auth.uid())
    )
  )
);
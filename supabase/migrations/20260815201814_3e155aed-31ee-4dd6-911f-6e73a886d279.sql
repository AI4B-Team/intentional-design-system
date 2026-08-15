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
    -- demo/sample transactions use non-UUID identifiers and reference no real record
    OR deal_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR EXISTS (
      SELECT 1 FROM public.property_transactions t
      WHERE t.id = public.transaction_checklist.deal_id::uuid
        AND (t.organization_id = ANY (public.user_org_ids()) OR t.user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = public.transaction_checklist.deal_id::uuid
        AND (p.organization_id = ANY (public.user_org_ids()) OR p.user_id = auth.uid())
    )
  )
);
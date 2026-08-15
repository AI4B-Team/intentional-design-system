-- 1. property_transactions: use active-membership helper
DROP POLICY IF EXISTS "Users can view their organization's transactions" ON public.property_transactions;
DROP POLICY IF EXISTS "Users can create transactions for their organization" ON public.property_transactions;
DROP POLICY IF EXISTS "Users can update their organization's transactions" ON public.property_transactions;
DROP POLICY IF EXISTS "Users can delete their organization's transactions" ON public.property_transactions;

CREATE POLICY "Workspace members view transactions"
ON public.property_transactions FOR SELECT TO authenticated
USING (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()));

CREATE POLICY "Workspace members create transactions"
ON public.property_transactions FOR INSERT TO authenticated
WITH CHECK (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()));

CREATE POLICY "Workspace members update transactions"
ON public.property_transactions FOR UPDATE TO authenticated
USING (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
WITH CHECK (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()));

CREATE POLICY "Workspace members delete transactions"
ON public.property_transactions FOR DELETE TO authenticated
USING (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()));

-- 2. funding_submissions: lender must be a real active marketplace lender
DROP POLICY IF EXISTS "Users can create submissions for their requests" ON public.funding_submissions;

CREATE POLICY "Request owners create submissions for listed lenders"
ON public.funding_submissions FOR INSERT TO authenticated
WITH CHECK (
  funding_request_id IN (
    SELECT id FROM public.funding_requests WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.marketplace_lenders ml
    WHERE ml.id = funding_submissions.lender_id AND ml.is_active = true
  )
);
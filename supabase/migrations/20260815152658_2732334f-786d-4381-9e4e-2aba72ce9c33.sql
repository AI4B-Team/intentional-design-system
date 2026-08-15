ALTER TABLE public.ghl_sync_log
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ghl_sync_log_organization_id_idx ON public.ghl_sync_log(organization_id);

DROP POLICY IF EXISTS "Workspace members can view sync log" ON public.ghl_sync_log;
CREATE POLICY "Workspace members can view sync log"
ON public.ghl_sync_log
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
);
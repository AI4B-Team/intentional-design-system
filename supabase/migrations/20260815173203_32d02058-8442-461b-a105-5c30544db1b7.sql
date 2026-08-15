ALTER TABLE public.mail_suppression_list ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS mail_suppression_list_org_idx ON public.mail_suppression_list(organization_id);

DROP POLICY IF EXISTS "Users can view their suppression list" ON public.mail_suppression_list;
DROP POLICY IF EXISTS "Users can insert to their suppression list" ON public.mail_suppression_list;
DROP POLICY IF EXISTS "Users can update their suppression list" ON public.mail_suppression_list;
DROP POLICY IF EXISTS "Users can delete from their suppression list" ON public.mail_suppression_list;

CREATE POLICY "Workspace members can view suppression list"
ON public.mail_suppression_list FOR SELECT TO authenticated
USING (auth.uid() = user_id OR organization_id = ANY (public.user_org_ids()));

CREATE POLICY "Workspace members can add to suppression list"
ON public.mail_suppression_list FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (organization_id IS NULL OR organization_id = ANY (public.user_org_ids())));

CREATE POLICY "Workspace members can update suppression list"
ON public.mail_suppression_list FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR organization_id = ANY (public.user_org_ids()));

CREATE POLICY "Workspace members can delete from suppression list"
ON public.mail_suppression_list FOR DELETE TO authenticated
USING (auth.uid() = user_id OR organization_id = ANY (public.user_org_ids()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mail_suppression_list TO authenticated;
GRANT ALL ON public.mail_suppression_list TO service_role;
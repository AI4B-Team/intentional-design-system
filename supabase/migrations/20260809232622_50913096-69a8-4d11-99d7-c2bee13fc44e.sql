CREATE OR REPLACE FUNCTION public.has_org_role(org_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND status = 'active'
      AND role::text = ANY(
        CASE required_role
          WHEN 'member' THEN ARRAY['member','caller','dispositions','acquisitions','manager','admin','owner']
          WHEN 'caller' THEN ARRAY['caller','acquisitions','manager','admin','owner']
          WHEN 'acquisitions' THEN ARRAY['acquisitions','manager','admin','owner']
          WHEN 'dispositions' THEN ARRAY['dispositions','manager','admin','owner']
          WHEN 'manager' THEN ARRAY['manager','admin','owner']
          WHEN 'admin' THEN ARRAY['admin','owner']
          WHEN 'owner' THEN ARRAY['owner']
          ELSE ARRAY[]::text[]
        END
      )
  );
$function$;

-- automation_settings
DROP POLICY IF EXISTS "managers insert automation_settings" ON public.automation_settings;
CREATE POLICY "managers insert automation_settings" ON public.automation_settings FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, 'manager'));
DROP POLICY IF EXISTS "managers update automation_settings" ON public.automation_settings;
CREATE POLICY "managers update automation_settings" ON public.automation_settings FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, 'manager'));
DROP POLICY IF EXISTS "managers delete automation_settings" ON public.automation_settings;
CREATE POLICY "managers delete automation_settings" ON public.automation_settings FOR DELETE TO authenticated USING (public.has_org_role(organization_id, 'manager'));

-- leads_scraper_health
DROP POLICY IF EXISTS "managers write scraper_health insert" ON public.leads_scraper_health;
CREATE POLICY "managers write scraper_health insert" ON public.leads_scraper_health FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, 'manager'));
DROP POLICY IF EXISTS "managers write scraper_health update" ON public.leads_scraper_health;
CREATE POLICY "managers write scraper_health update" ON public.leads_scraper_health FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, 'manager'));
DROP POLICY IF EXISTS "managers write scraper_health delete" ON public.leads_scraper_health;
CREATE POLICY "managers write scraper_health delete" ON public.leads_scraper_health FOR DELETE TO authenticated USING (public.has_org_role(organization_id, 'manager'));

-- loi_templates
DROP POLICY IF EXISTS "Users can update own LOI templates" ON public.loi_templates;
CREATE POLICY "Users can update own LOI templates" ON public.loi_templates FOR UPDATE TO authenticated USING (((organization_id IS NULL) AND (user_id = auth.uid())) OR public.has_org_role(organization_id, 'manager'));
DROP POLICY IF EXISTS "Users can delete own LOI templates" ON public.loi_templates;
CREATE POLICY "Users can delete own LOI templates" ON public.loi_templates FOR DELETE TO authenticated USING (((organization_id IS NULL) AND (user_id = auth.uid())) OR public.has_org_role(organization_id, 'admin'));

-- voice_agent_config
DROP POLICY IF EXISTS "Admins can manage agent config" ON public.voice_agent_config;
CREATE POLICY "Admins can manage agent config" ON public.voice_agent_config FOR ALL TO authenticated USING (public.has_org_role(organization_id, 'admin')) WITH CHECK (public.has_org_role(organization_id, 'admin'));
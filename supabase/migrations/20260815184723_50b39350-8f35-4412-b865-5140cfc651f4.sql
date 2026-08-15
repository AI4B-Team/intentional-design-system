DO $$
DECLARE t text;
DECLARE tables text[] := ARRAY[
  'offers','appointments','bids','campaign_properties','dispo_campaigns',
  'funding_requests','mail_campaigns','mail_lists','mail_templates',
  'saved_searches','jv_profiles','lender_loans','compliance_checks',
  'outreach_log','ghl_connections','lob_connections','closebot_connections',
  'closebot_conversations'
];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Workspace members manage %1$s" ON public.%1$I', t);
    EXECUTE format($f$
      CREATE POLICY "Workspace members manage %1$s"
      ON public.%1$I
      FOR ALL
      TO authenticated
      USING (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
      WITH CHECK (organization_id IS NOT NULL AND organization_id = ANY (public.user_org_ids()))
    $f$, t);
  END LOOP;
END $$;
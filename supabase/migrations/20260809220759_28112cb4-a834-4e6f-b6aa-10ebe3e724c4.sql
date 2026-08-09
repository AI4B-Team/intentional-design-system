CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(organization_id), ARRAY[]::uuid[])
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND status = 'active';
$$;

REVOKE EXECUTE ON FUNCTION public.user_org_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_org_ids() TO authenticated;

DO $do$
DECLARE
  p record;
  v_qual text;
  v_check text;
  v_roles text;
  v_sql text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual LIKE '%get_user_organization()%' OR with_check LIKE '%get_user_organization()%')
  LOOP
    v_qual := replace(coalesce(p.qual, ''), '= get_user_organization()', '= ANY (public.user_org_ids())');
    v_check := replace(coalesce(p.with_check, ''), '= get_user_organization()', '= ANY (public.user_org_ids())');

    IF v_qual LIKE '%get_user_organization()%' OR v_check LIKE '%get_user_organization()%' THEN
      RAISE EXCEPTION 'Unhandled get_user_organization() usage in policy %.% (%)', p.tablename, p.policyname, p.cmd;
    END IF;

    v_roles := array_to_string(p.roles, ', ');

    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);

    v_sql := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      p.policyname, p.schemaname, p.tablename,
      CASE WHEN p.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
      p.cmd, v_roles);

    IF p.qual IS NOT NULL THEN
      v_sql := v_sql || format(' USING (%s)', v_qual);
    END IF;
    IF p.with_check IS NOT NULL THEN
      v_sql := v_sql || format(' WITH CHECK (%s)', v_check);
    END IF;

    EXECUTE v_sql;
  END LOOP;
END
$do$;
REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, numeric, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_credits(uuid, numeric, text, text, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.upsert_contact_from_source(uuid, uuid, text, text, text, text, text, text, uuid, text, text, text, text, text, text[]) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_deal_slug(text, text, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_queue_stats(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_sync_contacts(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_next_queue_contact(uuid, uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.get_next_queue_contact(p_queue_id uuid, p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_contact_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT id INTO v_contact_id
  FROM call_queue_contacts
  WHERE queue_id = p_queue_id
    AND user_id = v_user_id
    AND status = 'pending'
    AND (next_attempt_after IS NULL OR next_attempt_after <= NOW())
  ORDER BY priority_score DESC, position ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_contact_id IS NOT NULL THEN
    UPDATE call_queue_contacts
    SET status = 'in_progress', updated_at = now()
    WHERE id = v_contact_id;
  END IF;

  RETURN v_contact_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.bulk_sync_contacts(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_synced integer := 0;
  v_count integer;
  v_user_id uuid := COALESCE(auth.uid(), p_user_id);
BEGIN
  IF auth.uid() IS NULL AND current_setting('role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      p.user_id, p.organization_id, p.owner_name, p.owner_email, p.owner_phone,
      NULL, 'seller', 'pipeline', p.id, p.address, p.city, p.state, p.zip
    ) AS contact_id
    FROM properties p
    WHERE p.user_id = v_user_id
      AND p.owner_name IS NOT NULL
      AND TRIM(p.owner_name) != ''
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      cb.user_id, cb.organization_id,
      COALESCE(cb.full_name, TRIM(COALESCE(cb.first_name, '') || ' ' || COALESCE(cb.last_name, ''))),
      cb.email, cb.phone, cb.company_name, 'buyer', 'cash_buyers', cb.id
    ) AS contact_id
    FROM cash_buyers cb
    WHERE cb.user_id = v_user_id
      AND (cb.full_name IS NOT NULL OR cb.first_name IS NOT NULL)
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      c.user_id, c.organization_id, c.name, c.email, c.phone,
      c.company, 'contractor', 'contractors', c.id
    ) AS contact_id
    FROM contractors c
    WHERE c.user_id = v_user_id
      AND c.name IS NOT NULL
      AND TRIM(c.name) != ''
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      cp.user_id, cp.organization_id, cp.agent_name, cp.agent_email,
      cp.agent_phone, cp.brokerage, 'agent', 'campaigns', cp.id
    ) AS contact_id
    FROM campaign_properties cp
    WHERE cp.user_id = v_user_id
      AND cp.agent_name IS NOT NULL
      AND TRIM(cp.agent_name) != ''
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  WITH distinct_calls AS (
    SELECT DISTINCT ON (contact_name, phone_number)
      user_id, organization_id, contact_name, phone_number, id
    FROM calls
    WHERE user_id = v_user_id
      AND contact_name IS NOT NULL
      AND TRIM(contact_name) != ''
    ORDER BY contact_name, phone_number, created_at DESC
  ),
  synced AS (
    SELECT public.upsert_contact_from_source(
      dc.user_id, dc.organization_id, dc.contact_name, NULL,
      dc.phone_number, NULL, 'seller', 'communications', dc.id
    ) AS contact_id
    FROM distinct_calls dc
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  RETURN jsonb_build_object('success', true, 'synced', v_synced);
END;
$function$;
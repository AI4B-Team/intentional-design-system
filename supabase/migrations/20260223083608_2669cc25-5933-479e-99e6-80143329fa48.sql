
-- Add source tracking columns to deal_sources
ALTER TABLE public.deal_sources 
  ADD COLUMN IF NOT EXISTS source_origin text,
  ADD COLUMN IF NOT EXISTS source_entity_id uuid;

-- Create unique index for deduplication (same source + entity = same contact)
CREATE UNIQUE INDEX IF NOT EXISTS idx_deal_sources_source_entity 
  ON public.deal_sources (user_id, source_origin, source_entity_id) 
  WHERE source_origin IS NOT NULL AND source_entity_id IS NOT NULL;

-- Function to upsert a contact from any source
CREATE OR REPLACE FUNCTION public.upsert_contact_from_source(
  p_user_id uuid,
  p_org_id uuid,
  p_name text,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_company text DEFAULT NULL,
  p_type text DEFAULT 'seller',
  p_source_origin text DEFAULT NULL,
  p_source_entity_id uuid DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_zip text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_tags text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
  v_existing_id uuid;
BEGIN
  -- Skip if no name
  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    RETURN NULL;
  END IF;

  -- First check by source_origin + source_entity_id (exact match)
  IF p_source_origin IS NOT NULL AND p_source_entity_id IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM deal_sources
    WHERE user_id = p_user_id
      AND source_origin = p_source_origin
      AND source_entity_id = p_source_entity_id;
  END IF;

  -- If no source match, try email match
  IF v_existing_id IS NULL AND p_email IS NOT NULL AND TRIM(p_email) != '' THEN
    SELECT id INTO v_existing_id
    FROM deal_sources
    WHERE user_id = p_user_id
      AND LOWER(email) = LOWER(TRIM(p_email))
    LIMIT 1;
  END IF;

  -- If no email match, try phone match
  IF v_existing_id IS NULL AND p_phone IS NOT NULL AND TRIM(p_phone) != '' THEN
    SELECT id INTO v_existing_id
    FROM deal_sources
    WHERE user_id = p_user_id
      AND REGEXP_REPLACE(phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(TRIM(p_phone), '[^0-9]', '', 'g')
      AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) >= 7
    LIMIT 1;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    -- Merge: update only NULL fields
    UPDATE deal_sources SET
      email = COALESCE(deal_sources.email, NULLIF(TRIM(p_email), '')),
      phone = COALESCE(deal_sources.phone, NULLIF(TRIM(p_phone), '')),
      company = COALESCE(deal_sources.company, NULLIF(TRIM(p_company), '')),
      address = COALESCE(deal_sources.address, NULLIF(TRIM(p_address), '')),
      city = COALESCE(deal_sources.city, NULLIF(TRIM(p_city), '')),
      state = COALESCE(deal_sources.state, NULLIF(TRIM(p_state), '')),
      zip = COALESCE(deal_sources.zip, NULLIF(TRIM(p_zip), '')),
      source_origin = COALESCE(deal_sources.source_origin, p_source_origin),
      source_entity_id = COALESCE(deal_sources.source_entity_id, p_source_entity_id),
      updated_at = now()
    WHERE id = v_existing_id;
    RETURN v_existing_id;
  ELSE
    -- Insert new contact
    INSERT INTO deal_sources (
      user_id, organization_id, name, email, phone, company, type,
      source, source_origin, source_entity_id,
      address, city, state, zip, notes, tags, status
    ) VALUES (
      p_user_id, p_org_id, TRIM(p_name), NULLIF(TRIM(p_email), ''), 
      NULLIF(TRIM(p_phone), ''), NULLIF(TRIM(p_company), ''), p_type,
      p_source_origin, p_source_origin, p_source_entity_id,
      NULLIF(TRIM(p_address), ''), NULLIF(TRIM(p_city), ''),
      NULLIF(TRIM(p_state), ''), NULLIF(TRIM(p_zip), ''),
      p_notes, p_tags, 'cold'
    )
    RETURNING id INTO v_contact_id;
    RETURN v_contact_id;
  END IF;
END;
$$;

-- Trigger: properties → seller contacts
CREATE OR REPLACE FUNCTION public.sync_property_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_name IS NOT NULL AND TRIM(NEW.owner_name) != '' THEN
    PERFORM public.upsert_contact_from_source(
      NEW.user_id,
      NEW.organization_id,
      NEW.owner_name,
      NEW.owner_email,
      NEW.owner_phone,
      NULL,
      'seller',
      'pipeline',
      NEW.id,
      NEW.address,
      NEW.city,
      NEW.state,
      NEW.zip
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_property_to_contacts
AFTER INSERT OR UPDATE OF owner_name, owner_email, owner_phone
ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.sync_property_to_contacts();

-- Trigger: cash_buyers → buyer contacts
CREATE OR REPLACE FUNCTION public.sync_cash_buyer_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.full_name, NEW.first_name || ' ' || NEW.last_name) IS NOT NULL THEN
    PERFORM public.upsert_contact_from_source(
      NEW.user_id,
      NEW.organization_id,
      COALESCE(NEW.full_name, TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''))),
      NEW.email,
      NEW.phone,
      NEW.company_name,
      'buyer',
      'cash_buyers',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_cash_buyer_to_contacts
AFTER INSERT OR UPDATE OF full_name, first_name, last_name, email, phone
ON public.cash_buyers
FOR EACH ROW
EXECUTE FUNCTION public.sync_cash_buyer_to_contacts();

-- Trigger: contractors → contractor contacts
CREATE OR REPLACE FUNCTION public.sync_contractor_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.name IS NOT NULL AND TRIM(NEW.name) != '' THEN
    PERFORM public.upsert_contact_from_source(
      NEW.user_id,
      NEW.organization_id,
      NEW.name,
      NEW.email,
      NEW.phone,
      NEW.company,
      'contractor',
      'contractors',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_contractor_to_contacts
AFTER INSERT OR UPDATE OF name, email, phone
ON public.contractors
FOR EACH ROW
EXECUTE FUNCTION public.sync_contractor_to_contacts();

-- Trigger: campaign_properties → agent contacts
CREATE OR REPLACE FUNCTION public.sync_campaign_agent_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.agent_name IS NOT NULL AND TRIM(NEW.agent_name) != '' THEN
    PERFORM public.upsert_contact_from_source(
      NEW.user_id,
      NEW.organization_id,
      NEW.agent_name,
      NEW.agent_email,
      NEW.agent_phone,
      NEW.brokerage,
      'agent',
      'campaigns',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_campaign_agent_to_contacts
AFTER INSERT OR UPDATE OF agent_name, agent_email, agent_phone
ON public.campaign_properties
FOR EACH ROW
EXECUTE FUNCTION public.sync_campaign_agent_to_contacts();

-- Trigger: calls → contacts (from call history)
CREATE OR REPLACE FUNCTION public.sync_call_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.contact_name IS NOT NULL AND TRIM(NEW.contact_name) != '' THEN
    PERFORM public.upsert_contact_from_source(
      NEW.user_id,
      NEW.organization_id,
      NEW.contact_name,
      NULL,
      NEW.phone_number,
      NULL,
      'seller',
      'communications',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_call_to_contacts
AFTER INSERT
ON public.calls
FOR EACH ROW
EXECUTE FUNCTION public.sync_call_to_contacts();

-- Bulk sync function for existing data
CREATE OR REPLACE FUNCTION public.bulk_sync_contacts(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_synced integer := 0;
  v_count integer;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM organization_members
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  -- Sync from properties
  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      p.user_id, p.organization_id, p.owner_name, p.owner_email, p.owner_phone,
      NULL, 'seller', 'pipeline', p.id, p.address, p.city, p.state, p.zip
    ) AS contact_id
    FROM properties p
    WHERE p.user_id = p_user_id
      AND p.owner_name IS NOT NULL
      AND TRIM(p.owner_name) != ''
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  -- Sync from cash_buyers
  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      cb.user_id, cb.organization_id,
      COALESCE(cb.full_name, TRIM(COALESCE(cb.first_name, '') || ' ' || COALESCE(cb.last_name, ''))),
      cb.email, cb.phone, cb.company_name, 'buyer', 'cash_buyers', cb.id
    ) AS contact_id
    FROM cash_buyers cb
    WHERE cb.user_id = p_user_id
      AND (cb.full_name IS NOT NULL OR cb.first_name IS NOT NULL)
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  -- Sync from contractors
  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      c.user_id, c.organization_id, c.name, c.email, c.phone,
      c.company, 'contractor', 'contractors', c.id
    ) AS contact_id
    FROM contractors c
    WHERE c.user_id = p_user_id
      AND c.name IS NOT NULL
      AND TRIM(c.name) != ''
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  -- Sync from campaign_properties
  WITH synced AS (
    SELECT public.upsert_contact_from_source(
      cp.user_id, cp.organization_id, cp.agent_name, cp.agent_email,
      cp.agent_phone, cp.brokerage, 'agent', 'campaigns', cp.id
    ) AS contact_id
    FROM campaign_properties cp
    WHERE cp.user_id = p_user_id
      AND cp.agent_name IS NOT NULL
      AND TRIM(cp.agent_name) != ''
  )
  SELECT COUNT(*) INTO v_count FROM synced WHERE contact_id IS NOT NULL;
  v_synced := v_synced + v_count;

  -- Sync from calls (distinct contacts only)
  WITH distinct_calls AS (
    SELECT DISTINCT ON (contact_name, phone_number)
      user_id, organization_id, contact_name, phone_number, id
    FROM calls
    WHERE user_id = p_user_id
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
$$;

CREATE OR REPLACE FUNCTION public.accept_organization_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  SELECT * INTO v_invite
  FROM public.organization_invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF v_invite IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_or_expired');
  END IF;

  IF lower(v_invite.email) <> lower(coalesce(v_email, '')) THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role, status, invited_by, invited_at, joined_at)
  VALUES (v_invite.organization_id, auth.uid(), v_invite.role, 'active', v_invite.invited_by, v_invite.created_at, now())
  ON CONFLICT (organization_id, user_id) DO UPDATE
    SET status = 'active', role = EXCLUDED.role, joined_at = now();

  UPDATE public.organization_invites
  SET accepted_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object('success', true, 'organization_id', v_invite.organization_id, 'role', v_invite.role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_organization_invite(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.lookup_organization_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
  v_org record;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  SELECT * INTO v_invite
  FROM public.organization_invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF v_invite IS NULL OR lower(v_invite.email) <> lower(coalesce(v_email, '')) THEN
    RETURN NULL;
  END IF;

  SELECT name, logo_url INTO v_org FROM public.organizations WHERE id = v_invite.organization_id;

  RETURN jsonb_build_object(
    'id', v_invite.id,
    'organization_id', v_invite.organization_id,
    'email', v_invite.email,
    'role', v_invite.role,
    'expires_at', v_invite.expires_at,
    'organization', jsonb_build_object('name', v_org.name, 'logo_url', v_org.logo_url)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_organization_invite(text) TO authenticated;
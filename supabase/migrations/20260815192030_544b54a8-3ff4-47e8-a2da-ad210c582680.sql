REVOKE ALL ON FUNCTION public.has_org_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_has_role(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_suppressed(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.normalize_address(text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.generate_address_hash(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.calculate_lead_score(text, text, text, boolean, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.calculate_distance_miles(numeric, numeric, numeric, numeric) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_has_role(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_suppressed(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.normalize_address(text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_address_hash(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_lead_score(text, text, text, boolean, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_distance_miles(numeric, numeric, numeric, numeric) TO authenticated, service_role;
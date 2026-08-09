REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, numeric, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_credits(uuid, numeric, text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_contact_from_source(uuid, uuid, text, text, text, text, text, text, uuid, text, text, text, text, text, text[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_deal_slug(text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_queue_stats(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_sync_contacts(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_next_queue_contact(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.bulk_sync_contacts(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_next_queue_contact(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_queue_stats(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, numeric, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, numeric, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_contact_from_source(uuid, uuid, text, text, text, text, text, text, uuid, text, text, text, text, text, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_deal_slug(text, text, uuid) TO service_role;
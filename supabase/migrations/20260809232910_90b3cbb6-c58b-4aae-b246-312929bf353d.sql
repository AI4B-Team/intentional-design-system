-- Trigger-only functions: remove direct execute rights from PUBLIC/anon/authenticated
REVOKE ALL ON FUNCTION public.auto_generate_deal_slug() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calculate_deal_equity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_feedback_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_property_stage_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_call_to_contacts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_campaign_agent_to_contacts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_cash_buyer_to_contacts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_contractor_to_contacts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_property_to_contacts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_update_queue_stats() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_feedback_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_feedback_vote_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_lead_sequence_step() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_queue_stats(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.auto_generate_deal_slug() TO service_role;
GRANT EXECUTE ON FUNCTION public.calculate_deal_equity() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_feedback_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.on_property_stage_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_call_to_contacts() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_campaign_agent_to_contacts() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_cash_buyer_to_contacts() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_contractor_to_contacts() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_property_to_contacts() TO service_role;
GRANT EXECUTE ON FUNCTION public.trigger_update_queue_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_feedback_comment_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_feedback_vote_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_lead_sequence_step() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_queue_stats(uuid) TO service_role;

-- Auth-only helpers: drop anonymous access, keep signed-in users
REVOKE ALL ON FUNCTION public.get_expiring_pofs(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_expiring_pofs(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_organization() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_organization() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.accept_organization_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_organization_invite(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.lookup_organization_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_organization_invite(text) TO authenticated, service_role;
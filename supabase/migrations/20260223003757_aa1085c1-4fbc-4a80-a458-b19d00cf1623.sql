
-- Stage-change trigger on properties table to auto-create Actions
CREATE OR REPLACE FUNCTION public.on_property_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_action_type text;
  v_title text;
  v_due_interval interval;
  v_priority text;
  v_contact text;
BEGIN
  -- Only fire on actual status changes
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get contact name from property owner info
  v_contact := COALESCE(NEW.owner_name, '');

  -- Define status → action rules
  CASE NEW.status
    WHEN 'contacted' THEN
      v_action_type := 'follow_up';
      v_title := 'Follow up after contact - ' || NEW.address;
      v_due_interval := interval '3 days';
      v_priority := 'medium';
    WHEN 'follow_up' THEN
      v_action_type := 'follow_up';
      v_title := 'Follow up - ' || NEW.address;
      v_due_interval := interval '2 days';
      v_priority := 'high';
    WHEN 'appointment' THEN
      v_action_type := 'appointment';
      v_title := 'Appointment scheduled - ' || NEW.address;
      v_due_interval := interval '1 day';
      v_priority := 'high';
    WHEN 'negotiating' THEN
      v_action_type := 'follow_up';
      v_title := 'Follow up on negotiation - ' || NEW.address;
      v_due_interval := interval '24 hours';
      v_priority := 'critical';
    WHEN 'offer_made' THEN
      v_action_type := 'follow_up';
      v_title := 'Follow up on offer - ' || NEW.address;
      v_due_interval := interval '48 hours';
      v_priority := 'high';
    WHEN 'under_contract' THEN
      v_action_type := 'deadline';
      v_title := 'Contract deadline check - ' || NEW.address;
      v_due_interval := interval '7 days';
      v_priority := 'high';
    WHEN 'closed', 'sold' THEN
      RETURN NEW;
    ELSE
      v_action_type := 'task';
      v_title := 'Review stage change - ' || NEW.address;
      v_due_interval := interval '3 days';
      v_priority := 'medium';
  END CASE;

  -- Insert the auto-generated action
  INSERT INTO public.unified_actions (
    user_id, organization_id, type, entity_type, entity_id,
    title, status, priority, due_at, source, source_ref,
    property_id, property_address, contact_name, owner_mode
  ) VALUES (
    NEW.user_id,
    NEW.organization_id,
    v_action_type,
    'deal',
    NEW.id,
    v_title,
    'pending',
    v_priority,
    now() + v_due_interval,
    'automation',
    'stage_change:' || COALESCE(OLD.status, 'none') || '->' || NEW.status,
    NEW.id,
    NEW.address,
    v_contact,
    'human'
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to properties table
DROP TRIGGER IF EXISTS trg_property_stage_change ON public.properties;
CREATE TRIGGER trg_property_stage_change
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.on_property_stage_change();

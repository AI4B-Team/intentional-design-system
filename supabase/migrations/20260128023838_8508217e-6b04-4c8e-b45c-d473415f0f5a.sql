-- Power Dialer Schema

-- 1. CALL_SCRIPTS TABLE (created first due to FK reference)
CREATE TABLE public.call_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  category text,
  
  opening text,
  body text,
  objection_handlers jsonb DEFAULT '[]',
  closing text,
  
  available_fields text[] DEFAULT ARRAY[
    'owner_name', 'owner_first_name', 'property_address', 
    'your_name', 'your_company', 'your_phone'
  ],
  
  use_count integer DEFAULT 0,
  success_rate decimal,
  
  is_default boolean DEFAULT false,
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CALL_QUEUES TABLE
CREATE TABLE public.call_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  
  source_type text NOT NULL CHECK (source_type IN ('list', 'properties', 'manual', 'followup')),
  source_list_id uuid REFERENCES public.lists ON DELETE SET NULL,
  source_filter jsonb,
  
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority integer DEFAULT 5,
  
  call_script_id uuid REFERENCES public.call_scripts ON DELETE SET NULL,
  max_attempts integer DEFAULT 3,
  days_between_attempts integer DEFAULT 2,
  
  calling_hours_start time DEFAULT '09:00',
  calling_hours_end time DEFAULT '20:00',
  calling_days text[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat'],
  timezone text DEFAULT 'America/New_York',
  respect_dnc boolean DEFAULT true,
  
  total_contacts integer DEFAULT 0,
  contacts_remaining integer DEFAULT 0,
  contacts_completed integer DEFAULT 0,
  contacts_reached integer DEFAULT 0,
  appointments_set integer DEFAULT 0,
  
  current_position integer DEFAULT 0,
  last_called_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CALL_QUEUE_CONTACTS TABLE
CREATE TABLE public.call_queue_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.call_queues ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  property_id uuid REFERENCES public.properties ON DELETE SET NULL,
  list_record_id uuid REFERENCES public.list_records ON DELETE SET NULL,
  
  contact_name text,
  phone_number text NOT NULL,
  phone_type text,
  alternate_phones text[],
  email text,
  
  property_address text,
  property_city text,
  property_state text,
  
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'skipped', 'removed', 'dnc'
  )),
  
  attempt_count integer DEFAULT 0,
  last_attempt_at timestamptz,
  next_attempt_after timestamptz,
  
  last_disposition text,
  last_call_id uuid,
  
  outcome text,
  outcome_notes text,
  
  position integer DEFAULT 0,
  priority_boost integer DEFAULT 0,
  
  priority_score integer GENERATED ALWAYS AS (
    COALESCE(priority_boost, 0) + 
    CASE WHEN attempt_count = 0 THEN 100 ELSE GREATEST(0, 50 - (attempt_count * 10)) END
  ) STORED,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_queue_contacts_queue ON public.call_queue_contacts(queue_id, status, priority_score DESC);
CREATE INDEX idx_queue_contacts_phone ON public.call_queue_contacts(phone_number);

-- 4. CALLS TABLE
CREATE TABLE public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  queue_id uuid REFERENCES public.call_queues ON DELETE SET NULL,
  queue_contact_id uuid REFERENCES public.call_queue_contacts ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties ON DELETE SET NULL,
  
  phone_number text NOT NULL,
  contact_name text,
  direction text DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  
  twilio_call_sid text,
  from_number text,
  to_number text,
  
  initiated_at timestamptz DEFAULT now(),
  answered_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  talk_time_seconds integer DEFAULT 0,
  ring_time_seconds integer DEFAULT 0,
  
  status text DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'ringing', 'in-progress', 'completed', 
    'busy', 'no-answer', 'failed', 'canceled'
  )),
  
  disposition text,
  disposition_category text CHECK (disposition_category IN (
    'contact_made', 'no_contact', 'bad_number', 'positive', 'negative', 'neutral'
  )),
  
  notes text,
  follow_up_date date,
  follow_up_time time,
  follow_up_notes text,
  
  recording_url text,
  recording_duration_seconds integer,
  recording_status text,
  transcription text,
  
  is_dnc_violation boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_calls_user_date ON public.calls(user_id, initiated_at DESC);
CREATE INDEX idx_calls_property ON public.calls(property_id, initiated_at DESC);
CREATE INDEX idx_calls_queue ON public.calls(queue_id, initiated_at DESC);
CREATE INDEX idx_calls_org ON public.calls(organization_id, initiated_at DESC);

-- 5. CALL_DISPOSITIONS TABLE
CREATE TABLE public.call_dispositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN (
    'contact_made', 'no_contact', 'bad_number', 'positive', 'negative', 'neutral'
  )),
  
  color text DEFAULT '#6B7280',
  icon text,
  
  removes_from_queue boolean DEFAULT false,
  adds_to_dnc boolean DEFAULT false,
  schedules_followup boolean DEFAULT false,
  default_followup_days integer,
  marks_as_success boolean DEFAULT false,
  
  keyboard_shortcut text,
  
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- Insert default dispositions
INSERT INTO public.call_dispositions (name, category, color, icon, keyboard_shortcut, removes_from_queue, adds_to_dnc, schedules_followup, default_followup_days, marks_as_success, is_system, sort_order) VALUES
('Appointment Set', 'positive', '#10B981', '📅', '1', true, false, true, 1, true, true, 1),
('Interested - Call Back', 'positive', '#3B82F6', '🔄', '2', false, false, true, 3, true, true, 2),
('Left Voicemail', 'no_contact', '#F59E0B', '📞', '3', false, false, true, 2, false, true, 3),
('No Answer', 'no_contact', '#6B7280', '❌', '4', false, false, true, 1, false, true, 4),
('Busy', 'no_contact', '#6B7280', '🔴', '5', false, false, true, 1, false, true, 5),
('Not Interested', 'negative', '#EF4444', '👎', '6', true, false, false, null, true, true, 6),
('Wrong Number', 'bad_number', '#F97316', '🚫', '7', true, false, false, null, false, true, 7),
('Do Not Call', 'bad_number', '#DC2626', '⛔', '8', true, true, false, null, false, true, 8),
('Disconnected', 'bad_number', '#6B7280', '📵', '9', true, false, false, null, false, true, 9),
('Spoke - No Decision', 'neutral', '#8B5CF6', '💬', '0', false, false, true, 7, true, true, 10);

-- Insert default script
INSERT INTO public.call_scripts (name, category, opening, body, objection_handlers, closing, is_default, is_system) VALUES
(
  'Motivated Seller Cold Call',
  'cold_call',
  'Hi, is this {{owner_name}}? Great! My name is {{your_name}} and I''m a local real estate investor. I was calling about your property at {{property_address}}.',
  '**Purpose:**
I help homeowners who are looking for a quick, hassle-free sale. I buy properties as-is, pay cash, and can close on your timeline.

**Key Questions:**
1. "Have you considered selling the property?"
2. "What would need to happen for you to consider an offer?"
3. "If I could make you a fair cash offer, would you be open to hearing it?"
4. "What''s your timeline - is there any urgency?"
5. "What do you think the property is worth?"

**Value Proposition:**
- No repairs needed - I buy as-is
- No real estate commissions
- Close in as little as 2 weeks
- Cash offer, no financing contingencies
- I handle all the paperwork',
  '[
    {"objection": "I''m not interested", "response": "I completely understand. Just out of curiosity, is there any situation where you might consider selling in the future?"},
    {"objection": "How did you get my number?", "response": "I was researching properties in the area and yours came up. I apologize if this is a bad time."},
    {"objection": "What will you offer?", "response": "I''d need to learn a bit more about the property first. Can I ask you a few quick questions?"},
    {"objection": "I need to think about it", "response": "Absolutely, take your time. When would be a good time for me to follow up?"},
    {"objection": "I''m working with an agent", "response": "No problem! If that doesn''t work out, keep my number. I can often close faster and with fewer hassles."}
  ]',
  'Thank you so much for your time, {{owner_first_name}}. I''ll [send over some information / follow up on {{follow_up_date}} / schedule that appointment]. Have a great day!',
  true,
  true
);

-- 6. DIALER_SESSIONS TABLE
CREATE TABLE public.dialer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  queue_id uuid REFERENCES public.call_queues ON DELETE SET NULL,
  
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  
  calls_made integer DEFAULT 0,
  calls_answered integer DEFAULT 0,
  contacts_reached integer DEFAULT 0,
  appointments_set integer DEFAULT 0,
  total_talk_time_seconds integer DEFAULT 0,
  
  avg_call_duration_seconds decimal,
  calls_per_hour decimal,
  
  session_notes text,
  
  created_at timestamptz DEFAULT now()
);

-- 7. ENABLE RLS
ALTER TABLE public.call_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_queue_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_dispositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialer_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies using org membership
CREATE POLICY "Users manage org queues" ON public.call_queues
  FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization() OR user_id = auth.uid());

CREATE POLICY "Users manage org queue contacts" ON public.call_queue_contacts
  FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization() OR user_id = auth.uid());

CREATE POLICY "Users manage org calls" ON public.calls
  FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization() OR user_id = auth.uid());

CREATE POLICY "Users see system and org dispositions" ON public.call_dispositions
  FOR SELECT TO authenticated
  USING (is_system = true OR organization_id = public.get_user_organization() OR user_id = auth.uid());

CREATE POLICY "Users manage own dispositions" ON public.call_dispositions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own dispositions" ON public.call_dispositions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users delete own dispositions" ON public.call_dispositions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users see system and org scripts" ON public.call_scripts
  FOR SELECT TO authenticated
  USING (is_system = true OR organization_id = public.get_user_organization() OR user_id = auth.uid());

CREATE POLICY "Users manage own scripts" ON public.call_scripts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own scripts" ON public.call_scripts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users delete own scripts" ON public.call_scripts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users manage org sessions" ON public.dialer_sessions
  FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization() OR user_id = auth.uid());

-- 8. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_next_queue_contact(p_queue_id uuid, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
BEGIN
  SELECT id INTO v_contact_id
  FROM call_queue_contacts
  WHERE queue_id = p_queue_id
    AND user_id = p_user_id
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
$$;

CREATE OR REPLACE FUNCTION public.update_queue_stats(p_queue_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE call_queues
  SET 
    contacts_remaining = (
      SELECT COUNT(*) FROM call_queue_contacts 
      WHERE queue_id = p_queue_id AND status = 'pending'
    ),
    contacts_completed = (
      SELECT COUNT(*) FROM call_queue_contacts 
      WHERE queue_id = p_queue_id AND status = 'completed'
    ),
    contacts_reached = (
      SELECT COUNT(*) FROM call_queue_contacts 
      WHERE queue_id = p_queue_id AND outcome IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = p_queue_id;
END;
$$;

-- Trigger to update queue stats automatically
CREATE OR REPLACE FUNCTION public.trigger_update_queue_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_queue_stats(COALESCE(NEW.queue_id, OLD.queue_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_queue_stats_on_contact_change
AFTER INSERT OR UPDATE OR DELETE ON public.call_queue_contacts
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_queue_stats();
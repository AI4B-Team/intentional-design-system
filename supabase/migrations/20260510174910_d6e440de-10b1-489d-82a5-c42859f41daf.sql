
-- ============ Phase 2: Sequence Builder + Team Handoff ============

-- 1. Sequences (templates)
CREATE TABLE public.lead_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft', -- draft | active | paused | archived
  enroll_tier text, -- hot | warm | cold | null (manual only)
  enroll_min_score integer,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_sequences_org ON public.lead_sequences(organization_id);
CREATE INDEX idx_lead_sequences_status ON public.lead_sequences(organization_id, status);

ALTER TABLE public.lead_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read sequences"
  ON public.lead_sequences FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "org members insert sequences"
  ON public.lead_sequences FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id) AND auth.uid() = user_id);

CREATE POLICY "org members update sequences"
  ON public.lead_sequences FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "org members delete sequences"
  ON public.lead_sequences FOR DELETE TO authenticated
  USING (public.is_org_member(organization_id));

CREATE TRIGGER trg_lead_sequences_updated_at
  BEFORE UPDATE ON public.lead_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2. Sequence steps (ordered)
CREATE TABLE public.lead_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL REFERENCES public.lead_sequences(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  step_order integer NOT NULL,
  step_type text NOT NULL, -- sms | mail | call | email | wait | human_task
  label text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {template_id, body, subject, etc.}
  wait_hours integer NOT NULL DEFAULT 0, -- delay BEFORE this step runs
  required_capability text, -- for human_task: e.g. 'call', 'mail'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, step_order)
);

CREATE INDEX idx_seq_steps_sequence ON public.lead_sequence_steps(sequence_id, step_order);

ALTER TABLE public.lead_sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read seq steps"
  ON public.lead_sequence_steps FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "org members write seq steps"
  ON public.lead_sequence_steps FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));


-- 3. Sequence enrollments (which leads are running which sequence)
CREATE TABLE public.lead_sequence_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL REFERENCES public.lead_sequences(id) ON DELETE CASCADE,
  lead_property_id uuid NOT NULL REFERENCES public.leads_properties(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  current_step integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- active | paused | completed | exited | failed
  exit_reason text,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  next_run_at timestamptz,
  last_advanced_at timestamptz,
  completed_at timestamptz,
  UNIQUE (sequence_id, lead_property_id)
);

CREATE INDEX idx_seq_enroll_org ON public.lead_sequence_enrollments(organization_id);
CREATE INDEX idx_seq_enroll_status ON public.lead_sequence_enrollments(organization_id, status, next_run_at);
CREATE INDEX idx_seq_enroll_lead ON public.lead_sequence_enrollments(lead_property_id);

ALTER TABLE public.lead_sequence_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read enrollments"
  ON public.lead_sequence_enrollments FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "org members write enrollments"
  ON public.lead_sequence_enrollments FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));


-- 4. Lead assignments (human handoff)
CREATE TABLE public.lead_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_property_id uuid NOT NULL REFERENCES public.leads_properties(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  assigned_to_user_id uuid NOT NULL,
  assigned_by_user_id uuid NOT NULL,
  role text, -- caller | acquisitions | dispositions | manager
  notes text,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | completed | declined
  assigned_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_lead_assignments_org ON public.lead_assignments(organization_id);
CREATE INDEX idx_lead_assignments_assignee ON public.lead_assignments(assigned_to_user_id, status);
CREATE INDEX idx_lead_assignments_lead ON public.lead_assignments(lead_property_id);

ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read assignments"
  ON public.lead_assignments FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "org members write assignments"
  ON public.lead_assignments FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));


-- 5. Team member capabilities (which step types each user can be assigned)
CREATE TABLE public.team_member_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  capabilities text[] NOT NULL DEFAULT ARRAY[]::text[], -- ['sms','mail','call','email','human_task']
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_team_capabilities_org ON public.team_member_capabilities(organization_id);

ALTER TABLE public.team_member_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read capabilities"
  ON public.team_member_capabilities FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "org members write capabilities"
  ON public.team_member_capabilities FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

CREATE TRIGGER trg_team_capabilities_updated_at
  BEFORE UPDATE ON public.team_member_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 6. Validation trigger: enforce step_type values (no CHECK constraint per project rules)
CREATE OR REPLACE FUNCTION public.validate_lead_sequence_step()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.step_type NOT IN ('sms','mail','call','email','wait','human_task') THEN
    RAISE EXCEPTION 'Invalid step_type: %', NEW.step_type;
  END IF;
  IF NEW.step_order < 1 THEN
    RAISE EXCEPTION 'step_order must be >= 1';
  END IF;
  IF NEW.wait_hours < 0 THEN
    RAISE EXCEPTION 'wait_hours must be >= 0';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_seq_step
  BEFORE INSERT OR UPDATE ON public.lead_sequence_steps
  FOR EACH ROW EXECUTE FUNCTION public.validate_lead_sequence_step();

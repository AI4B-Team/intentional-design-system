
-- Unified Action Model: Single source of truth for all tasks, follow-ups, deadlines, calls
CREATE TABLE public.unified_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL,

  -- Action classification
  type TEXT NOT NULL CHECK (type IN ('call', 'follow_up', 'appointment', 'deadline', 'doc', 'payment', 'task', 'inspection')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'deal', 'transaction', 'contact', 'property')),
  entity_id UUID, -- reference to the specific entity (property_id, deal_id, etc.)

  -- Content
  title TEXT NOT NULL,
  description TEXT,

  -- Status & priority
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled', 'snoozed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Time
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('ai', 'user', 'automation', 'system')),
  source_ref TEXT, -- optional reference to what created it (e.g., call_id, offer_id)

  -- Context for display
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_address TEXT,
  contact_name TEXT,

  -- Metadata for extensibility
  meta JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_unified_actions_org_status ON public.unified_actions(organization_id, status);
CREATE INDEX idx_unified_actions_user_status ON public.unified_actions(user_id, status);
CREATE INDEX idx_unified_actions_due_at ON public.unified_actions(due_at) WHERE status = 'pending';
CREATE INDEX idx_unified_actions_entity ON public.unified_actions(entity_type, entity_id);
CREATE INDEX idx_unified_actions_property ON public.unified_actions(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX idx_unified_actions_type ON public.unified_actions(type);

-- Enable RLS
ALTER TABLE public.unified_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies using org membership
CREATE POLICY "Users can view actions in their org"
  ON public.unified_actions FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can create actions in their org"
  ON public.unified_actions FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization() AND user_id = auth.uid());

CREATE POLICY "Users can update their own actions"
  ON public.unified_actions FOR UPDATE
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can delete their own actions"
  ON public.unified_actions FOR DELETE
  USING (user_id = auth.uid() AND organization_id = public.get_user_organization());

-- Auto-update updated_at
CREATE TRIGGER update_unified_actions_updated_at
  BEFORE UPDATE ON public.unified_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for instant cross-surface sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.unified_actions;

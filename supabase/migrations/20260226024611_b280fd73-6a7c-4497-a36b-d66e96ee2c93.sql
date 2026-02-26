-- Transaction checklist items (per deal)
CREATE TABLE public.transaction_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  item_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_id, stage, item_key, user_id)
);

-- Stage notes (per deal per stage)
CREATE TABLE public.transaction_stage_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_id, stage, user_id)
);

-- Enable RLS
ALTER TABLE public.transaction_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_stage_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for transaction_checklist
CREATE POLICY "Users can view org checklist items"
  ON public.transaction_checklist FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can insert own checklist items"
  ON public.transaction_checklist FOR INSERT
  WITH CHECK (auth.uid() = user_id AND organization_id = public.get_user_organization());

CREATE POLICY "Users can update org checklist items"
  ON public.transaction_checklist FOR UPDATE
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can delete own checklist items"
  ON public.transaction_checklist FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for transaction_stage_notes
CREATE POLICY "Users can view org stage notes"
  ON public.transaction_stage_notes FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can insert own stage notes"
  ON public.transaction_stage_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND organization_id = public.get_user_organization());

CREATE POLICY "Users can update org stage notes"
  ON public.transaction_stage_notes FOR UPDATE
  USING (organization_id = public.get_user_organization());

-- Triggers for updated_at
CREATE TRIGGER update_transaction_checklist_updated_at
  BEFORE UPDATE ON public.transaction_checklist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transaction_stage_notes_updated_at
  BEFORE UPDATE ON public.transaction_stage_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
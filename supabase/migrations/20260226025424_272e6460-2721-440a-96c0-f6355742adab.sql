
-- Create aiva_conversations table
CREATE TABLE public.aiva_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aiva_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies: org-based access
CREATE POLICY "Users can view own org conversations"
  ON public.aiva_conversations FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can insert own conversations"
  ON public.aiva_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id AND organization_id = public.get_user_organization());

CREATE POLICY "Users can update own conversations"
  ON public.aiva_conversations FOR UPDATE
  USING (auth.uid() = user_id AND organization_id = public.get_user_organization());

CREATE POLICY "Users can delete own conversations"
  ON public.aiva_conversations FOR DELETE
  USING (auth.uid() = user_id AND organization_id = public.get_user_organization());

-- Index for fast lookups
CREATE INDEX idx_aiva_conversations_user_updated ON public.aiva_conversations (user_id, updated_at DESC);

-- Auto-update updated_at
CREATE TRIGGER update_aiva_conversations_updated_at
  BEFORE UPDATE ON public.aiva_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

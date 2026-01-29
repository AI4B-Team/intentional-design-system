-- Create enum for LOI types (if not exists)
DO $$ BEGIN
  CREATE TYPE public.loi_type AS ENUM ('cash', 'creative', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for message direction (if not exists)
DO $$ BEGIN
  CREATE TYPE public.message_direction AS ENUM ('inbound', 'outbound');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create LOI templates table (if not exists)
CREATE TABLE IF NOT EXISTS public.loi_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  loi_type loi_type NOT NULL DEFAULT 'cash',
  description TEXT,
  offer_percentage NUMERIC DEFAULT 70,
  earnest_money_percentage NUMERIC DEFAULT 1,
  closing_days INTEGER DEFAULT 14,
  down_payment_percentage NUMERIC,
  interest_rate NUMERIC,
  term_months INTEGER,
  balloon_months INTEGER,
  monthly_payment_formula TEXT,
  subject_line TEXT,
  body_html TEXT,
  body_text TEXT,
  is_default BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create inbox messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  campaign_property_id UUID REFERENCES public.campaign_properties(id) ON DELETE SET NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_type TEXT DEFAULT 'agent',
  direction message_direction NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body TEXT,
  body_html TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  external_id TEXT,
  thread_id TEXT,
  in_reply_to UUID REFERENCES public.inbox_messages(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bulk offer batches table (if not exists)
CREATE TABLE IF NOT EXISTS public.offer_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT,
  loi_template_id UUID REFERENCES public.loi_templates(id),
  loi_type loi_type NOT NULL DEFAULT 'cash',
  offer_percentage NUMERIC DEFAULT 70,
  earnest_money NUMERIC DEFAULT 1000,
  closing_days INTEGER DEFAULT 14,
  down_payment_percentage NUMERIC,
  interest_rate NUMERIC,
  term_months INTEGER,
  status TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_properties INTEGER DEFAULT 0,
  offers_sent INTEGER DEFAULT 0,
  offers_opened INTEGER DEFAULT 0,
  offers_responded INTEGER DEFAULT 0,
  delivery_channels TEXT[] DEFAULT ARRAY['email'],
  daily_limit INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create batch offers junction table (if not exists)
CREATE TABLE IF NOT EXISTS public.batch_offer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.offer_batches(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_address TEXT NOT NULL,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_type TEXT DEFAULT 'agent',
  list_price NUMERIC,
  offer_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_type TEXT,
  response_notes TEXT,
  error_message TEXT,
  offer_id UUID REFERENCES public.offers(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_offer_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view org LOI templates" ON public.loi_templates;
DROP POLICY IF EXISTS "Users can create LOI templates" ON public.loi_templates;
DROP POLICY IF EXISTS "Users can update own LOI templates" ON public.loi_templates;
DROP POLICY IF EXISTS "Users can delete own LOI templates" ON public.loi_templates;

CREATE POLICY "Users can view org LOI templates" ON public.loi_templates FOR SELECT
USING (organization_id IS NULL AND user_id = auth.uid() OR organization_id = public.get_user_organization());

CREATE POLICY "Users can create LOI templates" ON public.loi_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own LOI templates" ON public.loi_templates FOR UPDATE
USING (organization_id IS NULL AND user_id = auth.uid() OR (organization_id = public.get_user_organization() AND public.user_has_role('manager')));

CREATE POLICY "Users can delete own LOI templates" ON public.loi_templates FOR DELETE
USING (organization_id IS NULL AND user_id = auth.uid() OR (organization_id = public.get_user_organization() AND public.user_has_role('admin')));

-- Inbox policies
DROP POLICY IF EXISTS "Users can view org inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Users can create inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Users can update org inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Users can delete own inbox messages" ON public.inbox_messages;

CREATE POLICY "Users can view org inbox messages" ON public.inbox_messages FOR SELECT
USING (organization_id IS NULL AND user_id = auth.uid() OR organization_id = public.get_user_organization());

CREATE POLICY "Users can create inbox messages" ON public.inbox_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update org inbox messages" ON public.inbox_messages FOR UPDATE
USING (organization_id IS NULL AND user_id = auth.uid() OR organization_id = public.get_user_organization());

CREATE POLICY "Users can delete own inbox messages" ON public.inbox_messages FOR DELETE
USING (user_id = auth.uid());

-- Offer batches policies
DROP POLICY IF EXISTS "Users can view org offer batches" ON public.offer_batches;
DROP POLICY IF EXISTS "Users can create offer batches" ON public.offer_batches;
DROP POLICY IF EXISTS "Users can update org offer batches" ON public.offer_batches;
DROP POLICY IF EXISTS "Users can delete own offer batches" ON public.offer_batches;

CREATE POLICY "Users can view org offer batches" ON public.offer_batches FOR SELECT
USING (organization_id IS NULL AND user_id = auth.uid() OR organization_id = public.get_user_organization());

CREATE POLICY "Users can create offer batches" ON public.offer_batches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update org offer batches" ON public.offer_batches FOR UPDATE
USING (organization_id IS NULL AND user_id = auth.uid() OR organization_id = public.get_user_organization());

CREATE POLICY "Users can delete own offer batches" ON public.offer_batches FOR DELETE
USING (user_id = auth.uid());

-- Batch items policies
DROP POLICY IF EXISTS "Users can view batch items via batch" ON public.batch_offer_items;
DROP POLICY IF EXISTS "Users can manage batch items via batch" ON public.batch_offer_items;

CREATE POLICY "Users can view batch items via batch" ON public.batch_offer_items FOR SELECT
USING (EXISTS (SELECT 1 FROM public.offer_batches ob WHERE ob.id = batch_offer_items.batch_id AND (ob.organization_id IS NULL AND ob.user_id = auth.uid() OR ob.organization_id = public.get_user_organization())));

CREATE POLICY "Users can manage batch items via batch" ON public.batch_offer_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.offer_batches ob WHERE ob.id = batch_offer_items.batch_id AND (ob.organization_id IS NULL AND ob.user_id = auth.uid() OR ob.organization_id = public.get_user_organization())));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inbox_messages_user ON public.inbox_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_org ON public.inbox_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_property ON public.inbox_messages(property_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_offer ON public.inbox_messages(offer_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread ON public.inbox_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_offer_batches_user ON public.offer_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_batches_org ON public.offer_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_offer_batches_status ON public.offer_batches(status);
CREATE INDEX IF NOT EXISTS idx_batch_offer_items_batch ON public.batch_offer_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_offer_items_property ON public.batch_offer_items(property_id);
CREATE INDEX IF NOT EXISTS idx_batch_offer_items_status ON public.batch_offer_items(status);

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_loi_templates_updated_at ON public.loi_templates;
CREATE TRIGGER update_loi_templates_updated_at BEFORE UPDATE ON public.loi_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inbox_messages_updated_at ON public.inbox_messages;
CREATE TRIGGER update_inbox_messages_updated_at BEFORE UPDATE ON public.inbox_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_offer_batches_updated_at ON public.offer_batches;
CREATE TRIGGER update_offer_batches_updated_at BEFORE UPDATE ON public.offer_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_batch_offer_items_updated_at ON public.batch_offer_items;
CREATE TRIGGER update_batch_offer_items_updated_at BEFORE UPDATE ON public.batch_offer_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
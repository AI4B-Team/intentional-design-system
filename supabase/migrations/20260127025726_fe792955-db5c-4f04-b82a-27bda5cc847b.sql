-- Create closebot_connections table
CREATE TABLE public.closebot_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key TEXT,
  account_id TEXT,
  account_name TEXT,
  is_active BOOLEAN DEFAULT false,
  webhook_secret TEXT DEFAULT gen_random_uuid()::text,
  bot_mappings JSONB DEFAULT '{}'::jsonb,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  trigger_settings JSONB DEFAULT '{"on_new_lead": false, "on_status_change": false, "manual_only": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create closebot_conversations table
CREATE TABLE public.closebot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  bot_id TEXT,
  bot_name TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  outcome TEXT,
  collected_data JSONB DEFAULT '{}'::jsonb,
  transcript TEXT,
  appointment_set BOOLEAN DEFAULT false,
  appointment_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.closebot_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closebot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for closebot_connections
CREATE POLICY "Users can view their own closebot connection"
  ON public.closebot_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own closebot connection"
  ON public.closebot_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own closebot connection"
  ON public.closebot_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own closebot connection"
  ON public.closebot_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for closebot_conversations
CREATE POLICY "Users can view their own closebot conversations"
  ON public.closebot_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own closebot conversations"
  ON public.closebot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own closebot conversations"
  ON public.closebot_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own closebot conversations"
  ON public.closebot_conversations FOR DELETE
  USING (auth.uid() = user_id);
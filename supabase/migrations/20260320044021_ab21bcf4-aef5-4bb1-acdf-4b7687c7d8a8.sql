
-- Voice agent configuration per organization
CREATE TABLE public.voice_agent_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Vapi config
  vapi_assistant_id TEXT,
  vapi_phone_number_id TEXT,
  
  -- Agent personality
  agent_name TEXT NOT NULL DEFAULT 'AIVA',
  agent_voice TEXT NOT NULL DEFAULT 'jennifer',
  agent_prompt TEXT,
  first_message TEXT DEFAULT 'Hi, this is AIVA from {company_name}. How can I help you today?',
  
  -- Behavior settings
  is_active BOOLEAN NOT NULL DEFAULT false,
  inbound_enabled BOOLEAN NOT NULL DEFAULT true,
  speed_to_lead_enabled BOOLEAN NOT NULL DEFAULT true,
  speed_to_lead_delay_seconds INTEGER NOT NULL DEFAULT 60,
  followup_enabled BOOLEAN NOT NULL DEFAULT false,
  followup_max_attempts INTEGER NOT NULL DEFAULT 3,
  followup_interval_hours INTEGER NOT NULL DEFAULT 24,
  
  -- Transfer settings
  hot_lead_transfer_enabled BOOLEAN NOT NULL DEFAULT true,
  transfer_phone_number TEXT,
  transfer_threshold TEXT NOT NULL DEFAULT 'high', -- low, medium, high
  
  -- Working hours
  working_hours_start TEXT DEFAULT '09:00',
  working_hours_end TEXT DEFAULT '18:00',
  working_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
  timezone TEXT DEFAULT 'America/New_York',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id)
);

-- Voice agent call log (supplements existing calls table with AI-specific data)
CREATE TABLE public.voice_agent_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  call_id UUID REFERENCES public.calls(id),
  
  -- Vapi metadata
  vapi_call_id TEXT,
  vapi_assistant_id TEXT,
  
  -- Call context
  direction TEXT NOT NULL DEFAULT 'inbound', -- inbound, speed_to_lead, followup
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  property_id UUID REFERENCES public.properties(id),
  property_address TEXT,
  
  -- AI conversation data
  transcript TEXT,
  summary TEXT,
  sentiment TEXT, -- positive, neutral, negative
  motivation_level TEXT, -- low, medium, high
  lead_score INTEGER,
  
  -- Outcomes
  outcome TEXT, -- qualified, not_interested, callback, transferred, voicemail, no_answer
  appointment_scheduled BOOLEAN DEFAULT false,
  appointment_time TIMESTAMPTZ,
  transferred_to TEXT,
  transferred_at TIMESTAMPTZ,
  
  -- CRM actions taken
  actions_taken JSONB DEFAULT '[]'::jsonb,
  tasks_created UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_agent_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for voice_agent_config
CREATE POLICY "Users can view own org agent config"
  ON public.voice_agent_config FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Admins can manage agent config"
  ON public.voice_agent_config FOR ALL
  USING (organization_id = public.get_user_organization() AND public.user_has_role('admin'));

-- RLS policies for voice_agent_calls
CREATE POLICY "Users can view own org agent calls"
  ON public.voice_agent_calls FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "System can insert agent calls"
  ON public.voice_agent_calls FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization());

-- Indexes
CREATE INDEX idx_voice_agent_calls_org ON public.voice_agent_calls(organization_id);
CREATE INDEX idx_voice_agent_calls_vapi ON public.voice_agent_calls(vapi_call_id);
CREATE INDEX idx_voice_agent_calls_direction ON public.voice_agent_calls(direction);
CREATE INDEX idx_voice_agent_calls_outcome ON public.voice_agent_calls(outcome);

-- Update trigger
CREATE TRIGGER update_voice_agent_config_updated_at
  BEFORE UPDATE ON public.voice_agent_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_agent_calls_updated_at
  BEFORE UPDATE ON public.voice_agent_calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- GOHIGHLEVEL INTEGRATION TABLES
-- =============================================

-- GHL Connections table (stores credentials and settings)
CREATE TABLE public.ghl_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    api_key TEXT, -- Encrypted API key
    location_id TEXT,
    access_token TEXT, -- For OAuth
    refresh_token TEXT, -- For OAuth
    expires_at TIMESTAMPTZ,
    account_name TEXT,
    is_active BOOLEAN DEFAULT false,
    sync_contacts_enabled BOOLEAN DEFAULT true,
    sync_pipeline_enabled BOOLEAN DEFAULT true,
    sync_appointments_enabled BOOLEAN DEFAULT true,
    two_way_sync_enabled BOOLEAN DEFAULT false,
    conflict_resolution TEXT DEFAULT 'dealflow_wins' CHECK (conflict_resolution IN ('dealflow_wins', 'ghl_wins', 'most_recent_wins')),
    ghl_pipeline_id TEXT,
    ghl_calendar_id TEXT,
    field_mappings JSONB DEFAULT '{}',
    stage_mappings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- GHL Sync Log table (tracks sync history)
CREATE TABLE public.ghl_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('contact', 'pipeline', 'appointment', 'task')),
    direction TEXT NOT NULL CHECK (direction IN ('to_ghl', 'from_ghl')),
    record_type TEXT NOT NULL,
    record_id UUID,
    ghl_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add GHL columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT,
ADD COLUMN IF NOT EXISTS ghl_last_sync TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.ghl_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ghl_connections
CREATE POLICY "Users can view their own GHL connection"
ON public.ghl_connections FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GHL connection"
ON public.ghl_connections FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GHL connection"
ON public.ghl_connections FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GHL connection"
ON public.ghl_connections FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for ghl_sync_log
CREATE POLICY "Users can view their own sync logs"
ON public.ghl_sync_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
ON public.ghl_sync_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_ghl_connections_user_id ON public.ghl_connections(user_id);
CREATE INDEX idx_ghl_sync_log_user_id ON public.ghl_sync_log(user_id);
CREATE INDEX idx_ghl_sync_log_created_at ON public.ghl_sync_log(created_at DESC);
CREATE INDEX idx_properties_ghl_contact_id ON public.properties(ghl_contact_id) WHERE ghl_contact_id IS NOT NULL;

-- Update trigger for ghl_connections
CREATE TRIGGER update_ghl_connections_updated_at
BEFORE UPDATE ON public.ghl_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
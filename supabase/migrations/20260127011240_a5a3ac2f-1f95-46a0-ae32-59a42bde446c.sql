-- Add missing columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS followup_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_sequences JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS batch_size_per_day INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE;

-- Add missing columns to campaign_properties table
ALTER TABLE public.campaign_properties
ADD COLUMN IF NOT EXISTS response_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS response_content TEXT,
ADD COLUMN IF NOT EXISTS followup_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_followup_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_campaign_properties_response_status ON public.campaign_properties(response_status);
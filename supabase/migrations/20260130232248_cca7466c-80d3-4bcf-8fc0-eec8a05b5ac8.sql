-- Extend deal_sources table with additional contact types and type-specific fields
-- New types: agent, seller, lender, buyer, vendor (previously: agent, wholesaler, lender)
-- Adding: seller, buyer, vendor, title_company, attorney, property_manager, inspector

-- Add new columns for extended contact types
ALTER TABLE public.deal_sources 
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS specialty text[],
  ADD COLUMN IF NOT EXISTS service_areas text[],
  ADD COLUMN IF NOT EXISTS rating numeric(3,2),
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS license_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pof_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pof_amount numeric,
  ADD COLUMN IF NOT EXISTS buy_box jsonb,
  ADD COLUMN IF NOT EXISTS lending_criteria jsonb,
  ADD COLUMN IF NOT EXISTS reliability_score integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS jobs_completed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS on_time_percentage integer,
  ADD COLUMN IF NOT EXISTS avg_close_days integer,
  ADD COLUMN IF NOT EXISTS tags text[];

-- Add comment for documentation
COMMENT ON TABLE public.deal_sources IS 'Unified contacts CRM for all real estate professional types: agent, seller, lender, buyer, vendor (wholesaler, title_company, attorney, property_manager, inspector, appraiser, insurance_agent, mortgage_broker, contractor)';

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_deal_sources_type ON public.deal_sources(type);

-- Create index on status for filtering  
CREATE INDEX IF NOT EXISTS idx_deal_sources_status ON public.deal_sources(status);

-- Create index on tags for filtering
CREATE INDEX IF NOT EXISTS idx_deal_sources_tags ON public.deal_sources USING GIN(tags);
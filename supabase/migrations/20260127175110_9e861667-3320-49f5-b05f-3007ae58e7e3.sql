
-- Add ATTOM-related columns to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS attom_id bigint,
  ADD COLUMN IF NOT EXISTS apn text,
  ADD COLUMN IF NOT EXISTS fips text,
  ADD COLUMN IF NOT EXISTS latitude decimal(10,7),
  ADD COLUMN IF NOT EXISTS longitude decimal(10,7),
  ADD COLUMN IF NOT EXISTS avm_value decimal(12,2),
  ADD COLUMN IF NOT EXISTS avm_high decimal(12,2),
  ADD COLUMN IF NOT EXISTS avm_low decimal(12,2),
  ADD COLUMN IF NOT EXISTS avm_confidence text,
  ADD COLUMN IF NOT EXISTS last_sale_date date,
  ADD COLUMN IF NOT EXISTS last_sale_price decimal(12,2),
  ADD COLUMN IF NOT EXISTS assessed_value decimal(12,2),
  ADD COLUMN IF NOT EXISTS tax_amount decimal(10,2),
  ADD COLUMN IF NOT EXISTS last_data_pull timestamptz;

-- Create index on attom_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_attom_id ON public.properties(attom_id);

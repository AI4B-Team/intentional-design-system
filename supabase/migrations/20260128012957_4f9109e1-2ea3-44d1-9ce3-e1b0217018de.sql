-- Lists table (each saved list)
CREATE TABLE public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- List info
  name text NOT NULL,
  description text,
  list_type text NOT NULL CHECK (list_type IN ('criteria', 'uploaded', 'stacked', 'manual')),
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'building', 'processing', 'failed', 'archived')),
  
  -- Criteria (for criteria-type lists)
  criteria jsonb DEFAULT '{}',
  
  -- Stacking (for stacked-type lists)
  stacked_from jsonb DEFAULT '[]',
  stack_criteria text,
  
  -- Source (for uploaded lists)
  source_file_name text,
  source_file_url text,
  column_mapping jsonb,
  
  -- Stats
  total_records integer DEFAULT 0,
  unique_records integer DEFAULT 0,
  matched_to_properties integer DEFAULT 0,
  skipped_duplicates integer DEFAULT 0,
  invalid_records integer DEFAULT 0,
  
  -- Scoring
  avg_motivation_score decimal,
  high_motivation_count integer DEFAULT 0,
  
  -- Usage tracking
  last_exported_at timestamptz,
  times_exported integer DEFAULT 0,
  last_mailed_at timestamptz,
  times_mailed integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  built_at timestamptz
);

-- List records table (individual records in a list)
CREATE TABLE public.list_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.lists ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Property identification
  property_id uuid REFERENCES public.properties ON DELETE SET NULL,
  
  -- Address
  address text,
  street_number text,
  street_name text,
  unit text,
  city text,
  state text,
  zip text,
  county text,
  
  -- Parsed/normalized address for dedup
  normalized_address text,
  address_hash text,
  
  -- Owner info
  owner_name text,
  owner_first_name text,
  owner_last_name text,
  owner_type text CHECK (owner_type IN ('individual', 'corporate', 'trust', 'estate', 'government', 'unknown')),
  
  -- Mailing address (if different)
  mailing_address text,
  mailing_city text,
  mailing_state text,
  mailing_zip text,
  is_absentee boolean DEFAULT false,
  
  -- Contact info
  phone text,
  email text,
  
  -- Property details
  property_type text,
  beds integer,
  baths decimal,
  sqft integer,
  lot_size decimal,
  year_built integer,
  
  -- Value estimates
  estimated_value decimal,
  assessed_value decimal,
  last_sale_price decimal,
  last_sale_date date,
  
  -- Equity
  estimated_equity_percent decimal,
  estimated_equity_amount decimal,
  
  -- Mortgage info
  mortgage_balance decimal,
  mortgage_date date,
  mortgage_lender text,
  
  -- Distress indicators
  distress_indicators text[] DEFAULT '{}',
  distress_details jsonb DEFAULT '{}',
  
  -- Scoring
  motivation_score integer,
  list_match_count integer DEFAULT 1,
  
  -- Stacking info
  source_lists uuid[] DEFAULT '{}',
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'skip_traced', 'contacted', 'mailed', 'removed', 'invalid')),
  skip_reason text,
  
  -- Validation
  is_valid boolean DEFAULT true,
  validation_errors text[],
  
  -- Original data
  raw_data jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- List criteria presets table
CREATE TABLE public.list_criteria_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  
  criteria jsonb NOT NULL,
  
  is_system boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  use_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- Suppression list table
CREATE TABLE public.suppression_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Address (normalized)
  normalized_address text NOT NULL,
  address_hash text NOT NULL,
  
  -- Original address
  address text,
  city text,
  state text,
  zip text,
  
  -- Reason
  reason text NOT NULL CHECK (reason IN (
    'do_not_contact', 'deceased', 'wrong_number', 'hostile',
    'already_sold', 'not_interested', 'returned_mail', 'duplicate', 'other'
  )),
  reason_notes text,
  
  -- Source
  source text,
  source_reference_id uuid,
  
  added_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Indexes for fast lookups and deduplication
CREATE INDEX idx_lists_user ON public.lists(user_id);
CREATE INDEX idx_lists_org ON public.lists(organization_id);
CREATE INDEX idx_lists_status ON public.lists(status);
CREATE INDEX idx_lists_type ON public.lists(list_type);

CREATE INDEX idx_list_records_list ON public.list_records(list_id);
CREATE INDEX idx_list_records_address_hash ON public.list_records(address_hash);
CREATE INDEX idx_list_records_normalized ON public.list_records(user_id, normalized_address);
CREATE INDEX idx_list_records_status ON public.list_records(list_id, status);
CREATE INDEX idx_list_records_property ON public.list_records(property_id);
CREATE INDEX idx_list_records_org ON public.list_records(organization_id);

CREATE INDEX idx_presets_user ON public.list_criteria_presets(user_id);
CREATE INDEX idx_presets_system ON public.list_criteria_presets(is_system);

CREATE UNIQUE INDEX idx_suppression_unique ON public.suppression_list(user_id, address_hash);
CREATE INDEX idx_suppression_org ON public.suppression_list(organization_id);

-- Enable RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_criteria_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lists
CREATE POLICY "Users manage own lists" ON public.lists
  FOR ALL USING (
    organization_id IS NULL AND auth.uid() = user_id
    OR organization_id IS NOT NULL AND public.is_org_member(organization_id)
  );

-- RLS Policies for list_records
CREATE POLICY "Users manage own list records" ON public.list_records
  FOR ALL USING (
    organization_id IS NULL AND auth.uid() = user_id
    OR organization_id IS NOT NULL AND public.is_org_member(organization_id)
  );

-- RLS Policies for list_criteria_presets
CREATE POLICY "Users see own and system presets" ON public.list_criteria_presets
  FOR SELECT USING (
    is_system = true
    OR auth.uid() = user_id
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

CREATE POLICY "Users manage own presets" ON public.list_criteria_presets
  FOR ALL USING (
    auth.uid() = user_id
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- RLS Policies for suppression_list
CREATE POLICY "Users manage own suppression" ON public.suppression_list
  FOR ALL USING (
    organization_id IS NULL AND auth.uid() = user_id
    OR organization_id IS NOT NULL AND public.is_org_member(organization_id)
  );

-- Helper function: Normalize address for deduplication
CREATE OR REPLACE FUNCTION public.normalize_address(
  p_address text,
  p_city text DEFAULT '',
  p_state text DEFAULT '',
  p_zip text DEFAULT ''
)
RETURNS text AS $$
DECLARE
  normalized text;
BEGIN
  normalized := COALESCE(p_address, '') || ' ' || 
                COALESCE(p_city, '') || ' ' || 
                COALESCE(p_state, '') || ' ' || 
                COALESCE(p_zip, '');
  
  normalized := LOWER(normalized);
  normalized := REGEXP_REPLACE(normalized, '[^a-z0-9\s]', '', 'g');
  
  normalized := REGEXP_REPLACE(normalized, '\bstreet\b', 'st', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bave(nue)?\b', 'ave', 'g');
  normalized := REGEXP_REPLACE(normalized, '\broad\b', 'rd', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bdrive\b', 'dr', 'g');
  normalized := REGEXP_REPLACE(normalized, '\blane\b', 'ln', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bcourt\b', 'ct', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bcircle\b', 'cir', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bboulevard\b', 'blvd', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bapartment\b', 'apt', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bsuite\b', 'ste', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bnorth\b', 'n', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bsouth\b', 's', 'g');
  normalized := REGEXP_REPLACE(normalized, '\beast\b', 'e', 'g');
  normalized := REGEXP_REPLACE(normalized, '\bwest\b', 'w', 'g');
  
  normalized := REGEXP_REPLACE(normalized, '\s+', ' ', 'g');
  normalized := TRIM(normalized);
  
  RETURN normalized;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Helper function: Generate address hash
CREATE OR REPLACE FUNCTION public.generate_address_hash(normalized_address text)
RETURNS text AS $$
BEGIN
  RETURN MD5(normalized_address);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Helper function: Check if address is in suppression list
CREATE OR REPLACE FUNCTION public.is_suppressed(
  p_user_id uuid,
  p_address_hash text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.suppression_list
    WHERE user_id = p_user_id
    AND address_hash = p_address_hash
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_list_records_updated_at
  BEFORE UPDATE ON public.list_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system presets
INSERT INTO public.list_criteria_presets (name, description, criteria, is_system) VALUES
(
  'Tax Delinquent Owners',
  'Property owners behind on taxes - highly motivated',
  '{"distress_types": ["tax_delinquent"], "equity_min": 20}',
  true
),
(
  'Pre-Foreclosure',
  'Properties in foreclosure process',
  '{"distress_types": ["pre_foreclosure", "nod", "lis_pendens"]}',
  true
),
(
  'Probate Properties',
  'Recently inherited properties',
  '{"distress_types": ["probate"], "owner": {"years_owned_max": 2}}',
  true
),
(
  'Tired Landlords',
  'Long-time landlords who may want to sell',
  '{"owner": {"absentee": true, "years_owned_min": 10}, "property_types": ["sfh", "multi"]}',
  true
),
(
  'High Equity Absentee',
  'Out-of-state owners with lots of equity',
  '{"owner": {"absentee": true, "out_of_state": true}, "equity_min": 50}',
  true
),
(
  'Vacant Properties',
  'Properties showing signs of vacancy',
  '{"distress_types": ["vacant"], "equity_min": 30}',
  true
),
(
  'Code Violations',
  'Properties with municipal code violations',
  '{"distress_types": ["code_violation"]}',
  true
),
(
  'Divorce Filings',
  'Property owners going through divorce',
  '{"distress_types": ["divorce"]}',
  true
),
(
  'Free & Clear',
  'Properties with no mortgage (100% equity)',
  '{"equity_min": 95, "owner": {"years_owned_min": 15}}',
  true
),
(
  'Golden List (Stack)',
  'Properties hitting 3+ distress indicators',
  '{"stack_minimum": 3}',
  true
);
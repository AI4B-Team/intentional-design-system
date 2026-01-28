-- Drop existing comps table (empty, safe to recreate)
DROP TABLE IF EXISTS comps;

-- 1. COMPS TABLE (comparable sales data)
CREATE TABLE comps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  
  -- Property being analyzed
  subject_property_id uuid REFERENCES properties ON DELETE SET NULL,
  analysis_id uuid,
  
  -- Comp property details
  address text NOT NULL,
  city text,
  state text,
  zip text,
  county text,
  
  -- Location
  latitude decimal,
  longitude decimal,
  distance_miles decimal,
  
  -- Property characteristics
  property_type text,
  beds integer,
  baths decimal,
  sqft integer,
  lot_sqft integer,
  year_built integer,
  stories integer,
  garage_spaces integer,
  pool boolean DEFAULT false,
  
  -- Sale info
  sale_price decimal,
  sale_date date,
  days_on_market integer,
  sale_type text,
  
  -- Listing info
  list_price decimal,
  original_list_price decimal,
  price_per_sqft decimal GENERATED ALWAYS AS (
    CASE WHEN sqft > 0 THEN sale_price / sqft ELSE NULL END
  ) STORED,
  
  -- Condition
  condition text,
  condition_notes text,
  
  -- Adjustments for ARV
  adjustments jsonb DEFAULT '{}',
  adjusted_price decimal,
  
  -- Photos
  photos jsonb DEFAULT '[]',
  
  -- Source
  source text,
  source_id text,
  
  -- Selection
  is_selected boolean DEFAULT false,
  weight decimal DEFAULT 1.0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comps_user ON comps(user_id, created_at DESC);
CREATE INDEX idx_comps_subject ON comps(subject_property_id);
CREATE INDEX idx_comps_analysis ON comps(analysis_id);
CREATE INDEX idx_comps_organization ON comps(organization_id);

-- 2. DEAL_ANALYSES TABLE (flip/wholesale calculations)
CREATE TABLE deal_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  property_id uuid REFERENCES properties ON DELETE SET NULL,
  
  name text NOT NULL,
  analysis_type text DEFAULT 'flip' CHECK (analysis_type IN ('flip', 'wholesale', 'brrrr', 'buy_hold')),
  
  -- Subject property
  address text NOT NULL,
  city text,
  state text,
  zip text,
  property_type text DEFAULT 'sfh',
  beds integer,
  baths decimal,
  sqft integer,
  lot_sqft integer,
  year_built integer,
  
  -- PURCHASE
  asking_price decimal,
  purchase_price decimal NOT NULL,
  earnest_money decimal DEFAULT 0,
  purchase_closing_costs decimal DEFAULT 0,
  purchase_closing_pct decimal DEFAULT 2,
  
  -- ARV
  arv decimal,
  arv_low decimal,
  arv_high decimal,
  arv_method text DEFAULT 'comps',
  arv_price_per_sqft decimal,
  arv_notes text,
  
  -- REPAIRS
  repair_estimate decimal DEFAULT 0,
  repair_contingency_pct decimal DEFAULT 10,
  repair_breakdown jsonb DEFAULT '{}',
  repair_scope text,
  repair_timeline_weeks integer DEFAULT 8,
  
  -- HOLDING COSTS
  holding_months decimal DEFAULT 6,
  property_taxes_monthly decimal DEFAULT 0,
  insurance_monthly decimal DEFAULT 0,
  utilities_monthly decimal DEFAULT 150,
  hoa_monthly decimal DEFAULT 0,
  lawn_maintenance_monthly decimal DEFAULT 0,
  loan_payment_monthly decimal DEFAULT 0,
  other_holding_monthly decimal DEFAULT 0,
  
  -- FINANCING
  financing_type text DEFAULT 'cash' CHECK (financing_type IN ('cash', 'hard_money', 'private_money', 'conventional', 'seller_finance')),
  down_payment_pct decimal DEFAULT 100,
  down_payment_amount decimal,
  loan_amount decimal DEFAULT 0,
  interest_rate decimal DEFAULT 0,
  loan_term_months integer DEFAULT 12,
  loan_points decimal DEFAULT 0,
  loan_origination_fee decimal DEFAULT 0,
  
  -- SELLING COSTS
  agent_commission_pct decimal DEFAULT 5,
  buyer_agent_commission_pct decimal DEFAULT 2.5,
  seller_closing_costs_pct decimal DEFAULT 1.5,
  staging_costs decimal DEFAULT 0,
  photography_costs decimal DEFAULT 500,
  marketing_costs decimal DEFAULT 0,
  seller_concessions decimal DEFAULT 0,
  
  -- WHOLESALE SPECIFIC
  assignment_fee decimal,
  end_buyer_name text,
  
  -- CALCULATED TOTALS
  total_purchase_cost decimal,
  total_repair_cost decimal,
  total_holding_cost decimal,
  total_financing_cost decimal,
  total_selling_cost decimal,
  total_project_cost decimal,
  
  gross_profit decimal,
  net_profit decimal,
  roi_percentage decimal,
  annualized_roi decimal,
  cash_on_cash decimal,
  profit_per_month decimal,
  
  -- MAO
  mao_70_pct decimal,
  mao_75_pct decimal,
  mao_80_pct decimal,
  mao_custom decimal,
  mao_custom_pct decimal DEFAULT 70,
  
  spread decimal,
  equity_capture decimal,
  break_even_price decimal,
  
  -- STATUS
  status text DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'offer_ready', 'offer_sent', 'negotiating', 'under_contract', 'closed', 'dead', 'archived')),
  
  notes text,
  attachments jsonb DEFAULT '[]',
  
  is_shared boolean DEFAULT false,
  shared_link_id text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_analyses_user ON deal_analyses(user_id, created_at DESC);
CREATE INDEX idx_deal_analyses_property ON deal_analyses(property_id);
CREATE INDEX idx_deal_analyses_organization ON deal_analyses(organization_id);

-- 3. RENTAL_ANALYSES TABLE (buy-and-hold / BRRRR)
CREATE TABLE rental_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  property_id uuid REFERENCES properties ON DELETE SET NULL,
  deal_analysis_id uuid REFERENCES deal_analyses ON DELETE SET NULL,
  
  name text NOT NULL,
  address text NOT NULL,
  city text,
  state text,
  zip text,
  property_type text DEFAULT 'sfh',
  beds integer,
  baths decimal,
  sqft integer,
  units integer DEFAULT 1,
  
  -- ACQUISITION
  purchase_price decimal NOT NULL,
  closing_costs decimal DEFAULT 0,
  rehab_costs decimal DEFAULT 0,
  total_acquisition decimal,
  arv decimal,
  
  -- FINANCING
  initial_financing_type text DEFAULT 'conventional',
  initial_down_payment_pct decimal DEFAULT 20,
  initial_down_payment decimal,
  initial_loan_amount decimal,
  initial_interest_rate decimal DEFAULT 7,
  initial_loan_term_years integer DEFAULT 30,
  initial_monthly_pi decimal,
  initial_pmi decimal DEFAULT 0,
  
  -- BRRRR REFINANCE
  is_brrrr boolean DEFAULT false,
  refinance_ltv_pct decimal DEFAULT 75,
  refinance_loan_amount decimal,
  refinance_interest_rate decimal,
  refinance_monthly_pi decimal,
  cash_out_amount decimal,
  cash_left_in_deal decimal,
  
  -- INCOME
  monthly_rent decimal NOT NULL,
  other_monthly_income decimal DEFAULT 0,
  gross_monthly_income decimal,
  vacancy_rate_pct decimal DEFAULT 8,
  credit_loss_pct decimal DEFAULT 2,
  effective_gross_income decimal,
  
  -- EXPENSES
  property_taxes_yearly decimal DEFAULT 0,
  insurance_yearly decimal DEFAULT 0,
  hoa_monthly decimal DEFAULT 0,
  property_management_pct decimal DEFAULT 10,
  maintenance_pct decimal DEFAULT 5,
  capex_reserve_pct decimal DEFAULT 5,
  utilities_monthly decimal DEFAULT 0,
  other_expenses_monthly decimal DEFAULT 0,
  
  total_monthly_expenses decimal,
  total_operating_expenses decimal,
  
  -- CASH FLOW
  noi decimal,
  monthly_debt_service decimal,
  monthly_cash_flow decimal,
  yearly_cash_flow decimal,
  
  -- RETURNS
  total_cash_invested decimal,
  cap_rate decimal,
  cash_on_cash_return decimal,
  gross_rent_multiplier decimal,
  debt_coverage_ratio decimal,
  
  one_pct_rule_met boolean,
  two_pct_rule_met boolean,
  
  -- PROJECTIONS
  appreciation_rate_pct decimal DEFAULT 3,
  rent_growth_rate_pct decimal DEFAULT 2,
  year_5_projection jsonb,
  year_10_projection jsonb,
  
  notes text,
  status text DEFAULT 'analyzing',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rental_analyses_user ON rental_analyses(user_id, created_at DESC);
CREATE INDEX idx_rental_analyses_organization ON rental_analyses(organization_id);

-- 4. REPAIR_ESTIMATES TABLE
CREATE TABLE repair_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  deal_analysis_id uuid REFERENCES deal_analyses ON DELETE CASCADE,
  property_id uuid REFERENCES properties ON DELETE SET NULL,
  
  name text NOT NULL,
  address text,
  sqft integer,
  
  method text DEFAULT 'detailed',
  scope text,
  
  quick_per_sqft decimal,
  quick_total decimal,
  
  line_items jsonb DEFAULT '[]',
  category_totals jsonb DEFAULT '{}',
  
  subtotal decimal DEFAULT 0,
  contingency_pct decimal DEFAULT 10,
  contingency_amount decimal DEFAULT 0,
  total_estimate decimal DEFAULT 0,
  
  total_materials decimal DEFAULT 0,
  total_labor decimal DEFAULT 0,
  
  estimated_weeks integer,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_repair_estimates_user ON repair_estimates(user_id, created_at DESC);
CREATE INDEX idx_repair_estimates_organization ON repair_estimates(organization_id);

-- 5. REPAIR_ITEMS_LIBRARY TABLE
CREATE TABLE repair_items_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  
  category text NOT NULL,
  name text NOT NULL,
  description text,
  
  unit text DEFAULT 'each',
  default_cost decimal NOT NULL,
  cost_low decimal,
  cost_high decimal,
  
  includes_labor boolean DEFAULT true,
  
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_repair_items_library_category ON repair_items_library(category);
CREATE INDEX idx_repair_items_library_user ON repair_items_library(user_id);

-- 6. MARKET_DATA TABLE
CREATE TABLE market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  
  location_type text NOT NULL,
  location_value text NOT NULL,
  city text,
  state text,
  county text,
  
  data_date date DEFAULT CURRENT_DATE,
  
  median_sale_price decimal,
  avg_sale_price decimal,
  median_price_per_sqft decimal,
  total_sales integer,
  
  price_change_1m_pct decimal,
  price_change_3m_pct decimal,
  price_change_1y_pct decimal,
  
  active_listings integer,
  new_listings integer,
  pending_sales integer,
  months_of_inventory decimal,
  
  median_dom integer,
  avg_dom integer,
  
  list_to_sale_ratio decimal,
  pct_over_asking decimal,
  
  median_rent decimal,
  avg_rent decimal,
  rent_per_sqft decimal,
  vacancy_rate decimal,
  
  price_to_rent_ratio decimal,
  gross_yield_pct decimal,
  cap_rate_estimate decimal,
  
  data_source text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_market_data_location ON market_data(location_type, location_value, data_date DESC);
CREATE INDEX idx_market_data_organization ON market_data(organization_id);

-- Add foreign key from comps to deal_analyses
ALTER TABLE comps ADD CONSTRAINT comps_analysis_id_fkey 
  FOREIGN KEY (analysis_id) REFERENCES deal_analyses(id) ON DELETE SET NULL;

-- 7. RLS POLICIES
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_items_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- Comps policies
CREATE POLICY "Users manage own comps" ON comps FOR ALL 
  USING (auth.uid() = user_id OR organization_id = public.get_user_organization());

-- Deal analyses policies
CREATE POLICY "Users manage own analyses" ON deal_analyses FOR ALL 
  USING (auth.uid() = user_id OR organization_id = public.get_user_organization());

-- Rental analyses policies
CREATE POLICY "Users manage own rentals" ON rental_analyses FOR ALL 
  USING (auth.uid() = user_id OR organization_id = public.get_user_organization());

-- Repair estimates policies
CREATE POLICY "Users manage own estimates" ON repair_estimates FOR ALL 
  USING (auth.uid() = user_id OR organization_id = public.get_user_organization());

-- Repair items library policies
CREATE POLICY "Users see own and system items" ON repair_items_library FOR SELECT 
  USING (auth.uid() = user_id OR is_system = true OR organization_id = public.get_user_organization());

CREATE POLICY "Users manage own items" ON repair_items_library FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own items" ON repair_items_library FOR UPDATE 
  USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users delete own items" ON repair_items_library FOR DELETE 
  USING (auth.uid() = user_id AND is_system = false);

-- Market data policies
CREATE POLICY "Users manage own market data" ON market_data FOR ALL 
  USING (auth.uid() = user_id OR user_id IS NULL OR organization_id = public.get_user_organization());

-- Insert default repair items library
INSERT INTO repair_items_library (category, name, unit, default_cost, cost_low, cost_high, is_system) VALUES
-- EXTERIOR
('Exterior', 'Roof - Full Replacement', 'sqft', 5.00, 4.00, 7.00, true),
('Exterior', 'Roof - Repair', 'each', 500, 300, 1500, true),
('Exterior', 'Siding - Vinyl', 'sqft', 6.00, 4.50, 8.00, true),
('Exterior', 'Exterior Paint', 'sqft', 2.00, 1.50, 3.00, true),
('Exterior', 'Gutters', 'lf', 8.00, 6.00, 12.00, true),
('Exterior', 'Driveway - Concrete', 'sqft', 8.00, 6.00, 12.00, true),
('Exterior', 'Fence - Wood 6ft', 'lf', 25.00, 18.00, 35.00, true),
('Exterior', 'Deck - New', 'sqft', 35.00, 25.00, 50.00, true),
-- INTERIOR
('Interior', 'Interior Paint', 'sqft', 2.00, 1.50, 3.00, true),
('Interior', 'Drywall - New', 'sqft', 3.00, 2.00, 4.50, true),
('Interior', 'Drywall - Repair', 'each', 150, 75, 300, true),
('Interior', 'Popcorn Ceiling Removal', 'sqft', 2.50, 1.50, 4.00, true),
('Interior', 'Crown Molding', 'lf', 8.00, 5.00, 12.00, true),
('Interior', 'Baseboards', 'lf', 5.00, 3.00, 8.00, true),
('Interior', 'Interior Doors', 'each', 250, 150, 400, true),
-- FLOORING
('Flooring', 'LVP/Vinyl Plank', 'sqft', 5.00, 3.50, 7.00, true),
('Flooring', 'Hardwood - New', 'sqft', 10.00, 7.00, 15.00, true),
('Flooring', 'Hardwood - Refinish', 'sqft', 4.00, 3.00, 6.00, true),
('Flooring', 'Tile - Ceramic', 'sqft', 8.00, 5.00, 12.00, true),
('Flooring', 'Carpet', 'sqft', 4.00, 2.50, 6.00, true),
-- KITCHEN
('Kitchen', 'Cabinets - Full Replacement', 'each', 8000, 5000, 15000, true),
('Kitchen', 'Cabinets - Reface', 'each', 4000, 2500, 6000, true),
('Kitchen', 'Cabinets - Paint', 'each', 1500, 800, 2500, true),
('Kitchen', 'Countertops - Granite', 'sqft', 60.00, 40.00, 80.00, true),
('Kitchen', 'Countertops - Quartz', 'sqft', 75.00, 55.00, 100.00, true),
('Kitchen', 'Countertops - Laminate', 'sqft', 25.00, 15.00, 40.00, true),
('Kitchen', 'Backsplash - Tile', 'sqft', 20.00, 12.00, 35.00, true),
('Kitchen', 'Sink - Stainless', 'each', 400, 250, 800, true),
('Kitchen', 'Faucet', 'each', 250, 150, 500, true),
('Kitchen', 'Appliance Package', 'each', 3000, 2000, 5000, true),
-- BATHROOM
('Bathroom', 'Full Bath Remodel', 'each', 10000, 6000, 18000, true),
('Bathroom', 'Half Bath Remodel', 'each', 5000, 3000, 8000, true),
('Bathroom', 'Vanity w/ Top', 'each', 600, 300, 1500, true),
('Bathroom', 'Toilet', 'each', 300, 200, 500, true),
('Bathroom', 'Tub/Shower - Fiberglass', 'each', 1200, 800, 2000, true),
('Bathroom', 'Tub/Shower - Tile', 'each', 3500, 2000, 6000, true),
('Bathroom', 'Bathtub Refinish', 'each', 400, 300, 600, true),
-- HVAC
('HVAC', 'Full System Replacement', 'each', 8000, 5000, 15000, true),
('HVAC', 'AC Condenser', 'each', 3500, 2500, 5500, true),
('HVAC', 'Furnace', 'each', 3000, 2000, 5000, true),
('HVAC', 'Ductwork', 'each', 2500, 1500, 5000, true),
-- ELECTRICAL
('Electrical', 'Panel Upgrade 200 amp', 'each', 2500, 1800, 4000, true),
('Electrical', 'Full Rewire', 'sqft', 5.00, 3.50, 8.00, true),
('Electrical', 'Outlet/Switch', 'each', 100, 50, 200, true),
('Electrical', 'Light Fixture', 'each', 150, 75, 400, true),
('Electrical', 'Ceiling Fan', 'each', 250, 150, 500, true),
-- PLUMBING
('Plumbing', 'Water Heater - Tank', 'each', 1500, 1000, 2500, true),
('Plumbing', 'Water Heater - Tankless', 'each', 3000, 2000, 4500, true),
('Plumbing', 'Re-pipe PEX', 'sqft', 4.00, 2.50, 6.00, true),
('Plumbing', 'Sewer Line Repair', 'each', 3000, 1500, 8000, true),
-- FOUNDATION
('Foundation', 'Foundation Repair - Minor', 'each', 3000, 1500, 6000, true),
('Foundation', 'Foundation Repair - Major', 'each', 10000, 5000, 25000, true),
-- WINDOWS
('Windows', 'Window Replacement', 'each', 500, 300, 900, true),
('Windows', 'Sliding Glass Door', 'each', 1200, 800, 2500, true),
('Windows', 'Entry Door', 'each', 1000, 500, 2000, true),
('Windows', 'Garage Door', 'each', 1200, 800, 2500, true),
-- LANDSCAPING
('Landscaping', 'Basic Cleanup', 'each', 1000, 500, 2000, true),
('Landscaping', 'Sod - Full Yard', 'sqft', 1.50, 1.00, 2.50, true),
('Landscaping', 'Tree Removal', 'each', 800, 400, 2000, true),
-- MISC
('Miscellaneous', 'Permits', 'each', 1500, 500, 5000, true),
('Miscellaneous', 'Dumpster Rental', 'each', 500, 350, 800, true),
('Miscellaneous', 'Cleaning', 'each', 500, 300, 1000, true);

-- Add updated_at triggers
CREATE TRIGGER update_comps_updated_at BEFORE UPDATE ON comps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_analyses_updated_at BEFORE UPDATE ON deal_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_analyses_updated_at BEFORE UPDATE ON rental_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repair_estimates_updated_at BEFORE UPDATE ON repair_estimates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
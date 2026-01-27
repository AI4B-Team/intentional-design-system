-- State Regulations Table (reference data)
CREATE TABLE public.state_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL UNIQUE,
  state_name TEXT NOT NULL,
  max_interest_rate DECIMAL,
  usury_exemptions TEXT,
  seller_financing_restrictions TEXT,
  lease_option_restrictions TEXT,
  land_contract_restrictions TEXT,
  required_disclosures TEXT[] DEFAULT '{}',
  licensing_requirements TEXT,
  foreclosure_type TEXT,
  redemption_period_days INTEGER,
  notes TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Checks Table
CREATE TABLE public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  state TEXT NOT NULL,
  deal_terms JSONB DEFAULT '{}',
  passed BOOLEAN DEFAULT false,
  warnings TEXT[] DEFAULT '{}',
  errors TEXT[] DEFAULT '{}',
  required_disclosures TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.state_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- State regulations - anyone can read
CREATE POLICY "Anyone can view state regulations"
ON public.state_regulations FOR SELECT
USING (true);

-- Compliance checks - user specific
CREATE POLICY "Users can view their own compliance checks"
ON public.compliance_checks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compliance checks"
ON public.compliance_checks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance checks"
ON public.compliance_checks FOR DELETE
USING (auth.uid() = user_id);

-- Seed top 10 investor states
INSERT INTO public.state_regulations (state_code, state_name, max_interest_rate, usury_exemptions, seller_financing_restrictions, lease_option_restrictions, land_contract_restrictions, required_disclosures, licensing_requirements, foreclosure_type, redemption_period_days, notes) VALUES
('TX', 'Texas', 10.00, 'Exemptions for loans over $250,000 or to corporations. Commercial loans exempt.', 'Owner financing allowed for residential. TREC requires specific contract forms. Dodd-Frank SAFE Act applies to 3+ seller-financed deals/year.', 'Lease-purchase agreements valid. No specific term limits. Option consideration not regulated.', 'Land contracts (executory contracts) heavily regulated. Must provide annual accounting. Seller must record. Buyer can convert to deed after paying 40% or 48 months.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'Seller financing addendum', 'Annual accounting statement for land contracts'], 'RMLO license required if 3+ seller-financed sales per year to non-family', 'non-judicial', 0, 'Texas has strong executory contract regulations. Property Code Chapter 5 governs.'),

('FL', 'Florida', 18.00, 'Consumer loans capped at 18%. Commercial loans generally exempt.', 'Seller financing permitted. Dodd-Frank applies to 3+ transactions. Documentary stamps required on notes.', 'Lease options valid. No specific restrictions on term length. Option fees not regulated.', 'Land contracts permitted. Recording recommended but not required. Forfeiture allowed with proper notice.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'HOA disclosure if applicable', 'Energy efficiency disclosure'], 'No state RMLO requirement beyond federal Dodd-Frank for 3+ transactions', 'judicial', 0, 'Florida is a judicial foreclosure state. Process takes 6-12 months typically.'),

('CA', 'California', 10.00, 'Exempt: Loans by banks, real estate brokers arranging loans, loans over $300,000. Business purpose loans generally exempt.', 'Heavily regulated. California Finance Lenders Law applies. Seller may do 1 seller-financed sale per year without license. Balloon disclosure required.', 'Lease options valid. Options exceeding 5 years may require subdivision compliance. Rent credits regulated under some local ordinances.', 'Land contracts (installment land sales) regulated. Civil Code 2985 et seq applies. Buyer has significant protections. Recording required for contracts over 1 year.', ARRAY['Transfer disclosure statement (TDS)', 'Natural hazard disclosure', 'Lead-based paint disclosure (pre-1978)', 'Mello-Roos disclosure', 'Supplemental tax disclosure', 'Smoke detector compliance', 'Water heater strapping'], 'California Finance Lenders Law license for more than 1 seller-financed transaction per year', 'non-judicial', 0, 'California has extensive disclosure requirements. Consult attorney for creative deals.'),

('OH', 'Ohio', 8.00, 'Exemptions for business loans, banks, credit unions. Higher rates allowed with proper disclosure.', 'Seller financing permitted. Ohio Mortgage Loan Act may apply. Balloon payments restricted on residential.', 'Lease options permitted. No specific term limits. Standard landlord-tenant law applies to lease portion.', 'Land contracts heavily used and regulated. Must record. R.C. 5313 governs. Forfeiture restricted - foreclosure often required if substantial equity.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'Residential property disclaimer'], 'Ohio RMLO license required for compensation-based loan origination', 'judicial', 0, 'Ohio is a land contract friendly state but has buyer protections.'),

('MI', 'Michigan', 7.00, 'Criminal usury at 25%. Civil usury at 7% for non-exempt loans. Business loans and loans over $250,000 exempt.', 'Seller financing permitted. Michigan Mortgage Brokers Act may apply. Interest rate restrictions significant for small residential loans.', 'Lease options valid. No specific term restrictions. Option fees not specifically regulated.', 'Land contracts very common. Must be recorded within 20 days. MCL 565.356 et seq. Forfeiture limited if 50% paid or 5 years of payments.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'Radon disclosure', 'Land contract specific disclosures'], 'Mortgage broker license may be required depending on structure', 'non-judicial', 180, 'Michigan has 6-month redemption period after foreclosure. Land contracts popular.'),

('GA', 'Georgia', 5.00, 'Criminal usury at 5% above prime for amounts under $3,000. Larger loans and business loans generally exempt. Typical market rates allowed for real estate.', 'Seller financing permitted. Georgia Residential Mortgage Act may apply. No balloon restrictions for seller-financed.', 'Lease options valid. No specific restrictions. Standard landlord-tenant law applies.', 'Land contracts (bonds for title) less common. Foreclosure rights similar to mortgage. Recording recommended.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'Community association disclosure if applicable'], 'RMLO license for loan origination activities', 'non-judicial', 0, 'Georgia has fast non-judicial foreclosure. Verify usury exemption applies.'),

('AZ', 'Arizona', NULL, 'No usury limit for most loans. Parties can agree to any rate.', 'Seller financing freely permitted. No rate restrictions. Dodd-Frank SAFE Act applies to 3+ transactions.', 'Lease options valid. No specific term limits. Option consideration negotiable.', 'Land contracts (agreements for sale) permitted. A.R.S. 33-741 et seq. Forfeiture with notice allowed but buyer protections exist for long-term contracts.', ARRAY['Property condition disclosure (SPDS)', 'Lead-based paint disclosure (pre-1978)', 'Affidavit of disclosure (5+ acre parcels)'], 'No state RMLO requirement beyond federal', 'non-judicial', 0, 'Arizona has no usury limit - very investor friendly for creative finance.'),

('NC', 'North Carolina', 8.00, 'Consumer Finance Act caps rates for licensed lenders. Real estate loans generally exempt from usury if properly structured.', 'Seller financing permitted. NC SAFE Act applies. Dodd-Frank compliance required for 3+ transactions.', 'Lease options valid. No specific restrictions on terms. Standard landlord-tenant law applies.', 'Land contracts permitted but less common. Recording recommended. Buyer protections through equity of redemption.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'Residential property disclosure', 'Mineral rights disclosure'], 'RMLO license for loan origination', 'non-judicial', 0, 'NC allows power of sale foreclosure. 10-day notice required.'),

('TN', 'Tennessee', 24.00, 'Industrial loan and thrift companies capped at 24%. Seller financing on real estate generally exempt from usury caps.', 'Seller financing permitted. Tennessee Residential Lending, Brokerage, and Servicing Act may apply. Dodd-Frank for 3+ transactions.', 'Lease options valid. No specific term limits. Not treated as sales unless transfer of title interest.', 'Land contracts permitted. Recording recommended. Forfeiture provisions generally enforceable with notice.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)'], 'RMLO license for loan origination activities', 'non-judicial', 0, 'Tennessee is investor friendly with non-judicial foreclosure.'),

('PA', 'Pennsylvania', 6.00, 'Usury limit is 6% without written agreement. Written agreements can specify higher rates. Commercial and certain mortgage loans exempt.', 'Seller financing permitted with written agreement for rate. Mortgage licensing may apply. Dodd-Frank for 3+ transactions.', 'Lease options valid. Installment Land Contract Act applies to options with purchase terms. Some tenant protections.', 'Land contracts (installment contracts) regulated under 68 P.S. § 901 et seq. Recording required. Forfeiture restricted - judicial action often required.', ARRAY['Property condition disclosure', 'Lead-based paint disclosure (pre-1978)', 'Radon disclosure'], 'Mortgage Licensing Act applies to loan origination', 'judicial', 0, 'PA requires written agreement for rates above 6%. Judicial foreclosure state.');

-- Create index for fast lookups
CREATE INDEX idx_state_regulations_state_code ON public.state_regulations(state_code);
CREATE INDEX idx_compliance_checks_property ON public.compliance_checks(property_id);
CREATE INDEX idx_compliance_checks_user ON public.compliance_checks(user_id);
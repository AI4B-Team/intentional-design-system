-- 1. USER_CREDITS TABLE (tracks user balances)
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  balance decimal DEFAULT 0,
  lifetime_purchased decimal DEFAULT 0,
  lifetime_used decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CREDIT_TRANSACTIONS TABLE (purchase/usage history)
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount decimal NOT NULL,
  balance_after decimal NOT NULL,
  description text,
  service text, -- 'skip_trace', 'property_lookup', etc.
  reference_id uuid, -- links to property_id, skip_trace_id, etc.
  stripe_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- 3. SKIP_TRACE_RESULTS TABLE (stores results)
CREATE TABLE public.skip_trace_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  
  -- Input data
  input_first_name text,
  input_last_name text,
  input_address text,
  input_city text,
  input_state text,
  input_zip text,
  
  -- Best results (auto-selected)
  primary_phone text,
  primary_phone_type text, -- mobile, landline, voip
  primary_phone_score integer, -- confidence 0-100
  primary_phone_dnc boolean DEFAULT false,
  primary_phone_verified boolean,
  
  primary_email text,
  primary_email_score integer,
  
  -- All results (full data)
  all_phones jsonb DEFAULT '[]',
  all_emails jsonb DEFAULT '[]',
  all_addresses jsonb DEFAULT '[]',
  relatives jsonb DEFAULT '[]',
  
  -- Flags
  deceased boolean DEFAULT false,
  bankruptcy boolean DEFAULT false,
  
  -- Billing
  credit_cost decimal NOT NULL,
  
  -- Status
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'no_results')),
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- 4. UPDATE PROPERTIES TABLE
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS skip_traced boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS skip_traced_at timestamptz;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS skip_trace_id uuid REFERENCES public.skip_trace_results(id);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS phone_dnc boolean DEFAULT false;

-- 5. PRICING CONFIGURATION TABLE
CREATE TABLE public.api_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text UNIQUE NOT NULL,
  cost_to_us decimal NOT NULL, -- what API charges us
  price_to_user decimal NOT NULL, -- what we charge user
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Insert default pricing
INSERT INTO public.api_pricing (service, cost_to_us, price_to_user) VALUES
  ('skip_trace', 0.15, 0.35),
  ('phone_dnc_check', 0.02, 0.05),
  ('phone_verification', 0.03, 0.08);

-- 6. RLS POLICIES
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skip_trace_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_pricing ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own skip traces" ON public.skip_trace_results
  FOR SELECT USING (auth.uid() = user_id);

-- Api pricing is readable by authenticated users
CREATE POLICY "Authenticated users view pricing" ON public.api_pricing
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. HELPER FUNCTION TO DEDUCT CREDITS
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount decimal,
  p_description text,
  p_service text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance decimal;
  v_new_balance decimal;
  v_org_id uuid;
BEGIN
  -- Get current balance with lock
  SELECT balance, organization_id INTO v_current_balance, v_org_id
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User credits not found');
  END IF;
  
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'balance', v_current_balance, 'required', p_amount);
  END IF;
  
  v_new_balance := v_current_balance - p_amount;
  
  -- Update balance
  UPDATE public.user_credits
  SET balance = v_new_balance,
      lifetime_used = lifetime_used + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, organization_id, type, amount, balance_after, description, service, reference_id)
  VALUES (p_user_id, v_org_id, 'usage', -p_amount, v_new_balance, p_description, p_service, p_reference_id);
  
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. HELPER FUNCTION TO ADD CREDITS
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount decimal,
  p_description text,
  p_type text DEFAULT 'purchase',
  p_stripe_payment_id text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_new_balance decimal;
  v_org_id uuid;
BEGIN
  UPDATE public.user_credits
  SET balance = balance + p_amount,
      lifetime_purchased = CASE WHEN p_type = 'purchase' THEN lifetime_purchased + p_amount ELSE lifetime_purchased END,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance, organization_id INTO v_new_balance, v_org_id;
  
  INSERT INTO public.credit_transactions (user_id, organization_id, type, amount, balance_after, description, stripe_payment_id)
  VALUES (p_user_id, v_org_id, p_type, p_amount, v_new_balance, p_description, p_stripe_payment_id);
  
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for performance
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_skip_trace_results_user_id ON public.skip_trace_results(user_id);
CREATE INDEX idx_skip_trace_results_property_id ON public.skip_trace_results(property_id);
CREATE INDEX idx_properties_skip_traced ON public.properties(skip_traced) WHERE skip_traced = true;
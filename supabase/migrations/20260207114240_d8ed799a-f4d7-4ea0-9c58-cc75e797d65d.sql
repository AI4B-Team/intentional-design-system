-- Transaction Roadmap: Property-specific deal workflow tracking

-- Enum for investment strategies
CREATE TYPE public.investment_strategy AS ENUM ('brrrr', 'flip', 'buy_and_hold', 'wholesale', 'str');

-- Main transaction roadmap table
CREATE TABLE public.property_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active',
    current_milestone INTEGER NOT NULL DEFAULT 1,
    
    -- Milestone 1: Deal Team (stores contact info directly or references deal_sources)
    lender_contact_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
    lender_name TEXT,
    lender_phone TEXT,
    lender_email TEXT,
    lender_confirmed BOOLEAN DEFAULT FALSE,
    lender_confirmed_at TIMESTAMP WITH TIME ZONE,
    realtor_contact_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
    realtor_name TEXT,
    realtor_phone TEXT,
    realtor_email TEXT,
    realtor_confirmed BOOLEAN DEFAULT FALSE,
    realtor_confirmed_at TIMESTAMP WITH TIME ZONE,
    milestone_1_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Milestone 2: Make & Negotiate Offer
    listing_price NUMERIC,
    mao NUMERIC,
    accepted_offer NUMERIC,
    accepted_offer_date TIMESTAMP WITH TIME ZONE,
    escrow_contact_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
    escrow_name TEXT,
    escrow_phone TEXT,
    escrow_email TEXT,
    escrow_confirmed BOOLEAN DEFAULT FALSE,
    milestone_2_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Milestone 3: Under Contract / Due Diligence
    inspector_contact_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
    inspector_name TEXT,
    inspector_phone TEXT,
    inspector_agent_recommended BOOLEAN DEFAULT FALSE,
    appraiser_contact_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
    appraiser_name TEXT,
    appraiser_phone TEXT,
    appraiser_agent_recommended BOOLEAN DEFAULT FALSE,
    insurance_contact_id UUID REFERENCES public.deal_sources(id) ON DELETE SET NULL,
    insurance_name TEXT,
    insurance_carrier TEXT,
    insurance_phone TEXT,
    milestone_3_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Milestone 4: Closing Checklist
    closing_financing_finalized BOOLEAN DEFAULT FALSE,
    closing_escrow_wired BOOLEAN DEFAULT FALSE,
    closing_final_walkthrough BOOLEAN DEFAULT FALSE,
    closing_documents_signed BOOLEAN DEFAULT FALSE,
    closing_keys_received BOOLEAN DEFAULT FALSE,
    milestone_4_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Milestone 5: Investment Strategy
    investment_strategy investment_strategy,
    strategy_phase_buy BOOLEAN DEFAULT FALSE,
    strategy_phase_rehab BOOLEAN DEFAULT FALSE,
    strategy_phase_rent BOOLEAN DEFAULT FALSE,
    strategy_phase_refinance BOOLEAN DEFAULT FALSE,
    strategy_phase_repeat BOOLEAN DEFAULT FALSE,
    milestone_5_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    total_days_to_close INTEGER,
    mao_vs_accepted_variance NUMERIC,
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.property_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's transactions"
ON public.property_transactions FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create transactions for their organization"
ON public.property_transactions FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their organization's transactions"
ON public.property_transactions FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their organization's transactions"
ON public.property_transactions FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
);

-- Create trigger for updated_at
CREATE TRIGGER update_property_transactions_updated_at
BEFORE UPDATE ON public.property_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_property_transactions_property_id ON public.property_transactions(property_id);
CREATE INDEX idx_property_transactions_organization_id ON public.property_transactions(organization_id);
CREATE INDEX idx_property_transactions_status ON public.property_transactions(status);
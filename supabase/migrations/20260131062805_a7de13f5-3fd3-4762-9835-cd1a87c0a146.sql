-- Create buyer_profiles table for managing multiple buyer identities for offer campaigns
CREATE TABLE public.buyer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Profile identity
  profile_name TEXT NOT NULL, -- Internal name for this profile (e.g., "Main LLC", "Partner Entity")
  buyer_name TEXT NOT NULL, -- Legal buyer name for offers
  company_name TEXT,
  
  -- Contact info
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  
  -- Linked POF document
  pof_id UUID REFERENCES public.proof_of_funds(id) ON DELETE SET NULL,
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org buyer profiles"
  ON public.buyer_profiles FOR SELECT
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can create buyer profiles in their org"
  ON public.buyer_profiles FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization());

CREATE POLICY "Users can update their org buyer profiles"
  ON public.buyer_profiles FOR UPDATE
  USING (organization_id = public.get_user_organization());

CREATE POLICY "Users can delete their org buyer profiles"
  ON public.buyer_profiles FOR DELETE
  USING (organization_id = public.get_user_organization());

-- Trigger for updated_at
CREATE TRIGGER update_buyer_profiles_updated_at
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_buyer_profiles_org ON public.buyer_profiles(organization_id);
CREATE INDEX idx_buyer_profiles_user ON public.buyer_profiles(user_id);
CREATE INDEX idx_buyer_profiles_default ON public.buyer_profiles(organization_id, is_default) WHERE is_default = true;
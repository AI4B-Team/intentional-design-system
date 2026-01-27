-- Create enum for profile types
CREATE TYPE public.jv_profile_type AS ENUM ('capital_partner', 'operating_partner', 'both');
CREATE TYPE public.jv_preferred_role AS ENUM ('passive', 'active', 'either');
CREATE TYPE public.jv_experience_level AS ENUM ('beginner', 'intermediate', 'experienced', 'expert');
CREATE TYPE public.jv_opportunity_status AS ENUM ('open', 'in_discussion', 'closed', 'cancelled');
CREATE TYPE public.jv_visibility AS ENUM ('public', 'connections_only', 'private');
CREATE TYPE public.jv_inquiry_status AS ENUM ('pending', 'accepted', 'declined');

-- JV Profiles Table
CREATE TABLE public.jv_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'both',
  available_capital DECIMAL,
  target_deal_types TEXT[] DEFAULT '{}',
  target_areas TEXT[] DEFAULT '{}',
  preferred_role TEXT DEFAULT 'either',
  experience_level TEXT DEFAULT 'beginner',
  deals_completed INTEGER DEFAULT 0,
  bio TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- JV Opportunities Table
CREATE TABLE public.jv_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  capital_needed DECIMAL,
  your_contribution TEXT,
  seeking TEXT,
  proposed_split TEXT,
  deal_type TEXT,
  location TEXT,
  status TEXT DEFAULT 'open',
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- JV Inquiries Table
CREATE TABLE public.jv_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.jv_opportunities(id) ON DELETE CASCADE,
  inquirer_user_id UUID NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jv_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jv_inquiries ENABLE ROW LEVEL SECURITY;

-- JV Profiles Policies
CREATE POLICY "Users can view public profiles"
ON public.jv_profiles FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.jv_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.jv_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.jv_profiles FOR DELETE
USING (auth.uid() = user_id);

-- JV Opportunities Policies
CREATE POLICY "Users can view public opportunities"
ON public.jv_opportunities FOR SELECT
USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own opportunities"
ON public.jv_opportunities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunities"
ON public.jv_opportunities FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunities"
ON public.jv_opportunities FOR DELETE
USING (auth.uid() = user_id);

-- JV Inquiries Policies
CREATE POLICY "Users can view inquiries on their opportunities"
ON public.jv_inquiries FOR SELECT
USING (
  auth.uid() = inquirer_user_id OR 
  opportunity_id IN (SELECT id FROM public.jv_opportunities WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create inquiries"
ON public.jv_inquiries FOR INSERT
WITH CHECK (auth.uid() = inquirer_user_id);

CREATE POLICY "Opportunity owners can update inquiries"
ON public.jv_inquiries FOR UPDATE
USING (
  opportunity_id IN (SELECT id FROM public.jv_opportunities WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own inquiries"
ON public.jv_inquiries FOR DELETE
USING (auth.uid() = inquirer_user_id);

-- Triggers for updated_at
CREATE TRIGGER update_jv_profiles_updated_at
BEFORE UPDATE ON public.jv_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jv_opportunities_updated_at
BEFORE UPDATE ON public.jv_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jv_inquiries_updated_at
BEFORE UPDATE ON public.jv_inquiries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
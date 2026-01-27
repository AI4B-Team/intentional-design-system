
-- Create app_role enum for organization roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'manager', 'acquisitions', 'dispositions', 'caller', 'member');

-- Create organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  timezone text DEFAULT 'America/New_York',
  billing_email text,
  subscription_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  max_users integer DEFAULT 1,
  max_properties integer DEFAULT 100,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_members table
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  status text DEFAULT 'active',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz,
  joined_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create organization_invites table
CREATE TABLE public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id) NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Create helper function: Get user's current organization
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() 
  AND status = 'active'
  LIMIT 1;
$$;

-- Create helper function: Check if user has specific role or higher
CREATE OR REPLACE FUNCTION public.user_has_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND role::text = ANY(
      CASE required_role
        WHEN 'member' THEN ARRAY['member', 'caller', 'dispositions', 'acquisitions', 'manager', 'admin', 'owner']
        WHEN 'caller' THEN ARRAY['caller', 'acquisitions', 'manager', 'admin', 'owner']
        WHEN 'acquisitions' THEN ARRAY['acquisitions', 'manager', 'admin', 'owner']
        WHEN 'dispositions' THEN ARRAY['dispositions', 'manager', 'admin', 'owner']
        WHEN 'manager' THEN ARRAY['manager', 'admin', 'owner']
        WHEN 'admin' THEN ARRAY['admin', 'owner']
        WHEN 'owner' THEN ARRAY['owner']
        ELSE ARRAY[]::text[]
      END
    )
  );
$$;

-- Create helper function: Check user's role in their organization
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM organization_members 
  WHERE user_id = auth.uid() 
  AND status = 'active'
  LIMIT 1;
$$;

-- Create helper function: Check if user is member of organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND status = 'active'
  );
$$;

-- Add organization_id, assigned_to, created_by to properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add organization_id to other tables
ALTER TABLE public.comps ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.outreach_log ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.deal_sources ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.buyers ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.mail_templates ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.mail_campaigns ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.mail_lists ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.funding_requests ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.jv_profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.campaign_properties ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.compliance_checks ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.closebot_connections ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.closebot_conversations ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ghl_connections ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.lob_connections ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.lender_loans ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for organization_id on all tables
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON public.properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_comps_organization_id ON public.comps(organization_id);
CREATE INDEX IF NOT EXISTS idx_offers_organization_id ON public.offers(organization_id);
CREATE INDEX IF NOT EXISTS idx_outreach_log_organization_id ON public.outreach_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON public.appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_deal_sources_organization_id ON public.deal_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_buyers_organization_id ON public.buyers(organization_id);
CREATE INDEX IF NOT EXISTS idx_mail_campaigns_organization_id ON public.mail_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_contractors_organization_id ON public.contractors(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);

-- RLS Policies for organizations table
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (public.is_org_member(id));

CREATE POLICY "Owners and admins can update their organization"
ON public.organizations FOR UPDATE
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Anyone can create an organization"
ON public.organizations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only owners can delete organization"
ON public.organizations FOR DELETE
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND role = 'owner'
  )
);

-- RLS Policies for organization_members table
CREATE POLICY "Users can view members of their organization"
ON public.organization_members FOR SELECT
USING (public.is_org_member(organization_id));

CREATE POLICY "Admins and owners can insert members"
ON public.organization_members FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
  OR NOT EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organization_members.organization_id)
);

CREATE POLICY "Admins and owners can update members"
ON public.organization_members FOR UPDATE
USING (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins and owners can delete members"
ON public.organization_members FOR DELETE
USING (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
  AND role != 'owner'
);

-- RLS Policies for organization_invites table
CREATE POLICY "Users can view invites for their organization"
ON public.organization_invites FOR SELECT
USING (
  public.is_org_member(organization_id)
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins and owners can create invites"
ON public.organization_invites FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins and owners can update invites"
ON public.organization_invites FOR UPDATE
USING (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins and owners can delete invites"
ON public.organization_invites FOR DELETE
USING (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin')
  )
);

-- Add updated_at trigger to organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Drop existing RLS policies on properties and recreate with organization-based policies
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;

-- Create organization-based policies for properties
CREATE POLICY "Users can view org properties"
ON public.properties FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR organization_id IS NULL AND user_id = auth.uid()
);

CREATE POLICY "Users can insert org properties"
ON public.properties FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can update org properties"
ON public.properties FOR UPDATE
USING (
  (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
      AND role IN ('owner', 'admin', 'manager')
    )
  )
  OR assigned_to = auth.uid()
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can delete org properties"
ON public.properties FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
    AND role IN ('owner', 'admin', 'manager')
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

-- Update buyers policies
DROP POLICY IF EXISTS "Users can view their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can insert their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can update their own buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can delete their own buyers" ON public.buyers;

CREATE POLICY "Users can view org buyers"
ON public.buyers FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can insert org buyers"
ON public.buyers FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can update org buyers"
ON public.buyers FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can delete org buyers"
ON public.buyers FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

-- Update contractors policies
DROP POLICY IF EXISTS "Users can view their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can insert their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can update their own contractors" ON public.contractors;
DROP POLICY IF EXISTS "Users can delete their own contractors" ON public.contractors;

CREATE POLICY "Users can view org contractors"
ON public.contractors FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can insert org contractors"
ON public.contractors FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can update org contractors"
ON public.contractors FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can delete org contractors"
ON public.contractors FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

-- Update deal_sources policies
DROP POLICY IF EXISTS "Users can view their own deal sources" ON public.deal_sources;
DROP POLICY IF EXISTS "Users can insert their own deal sources" ON public.deal_sources;
DROP POLICY IF EXISTS "Users can update their own deal sources" ON public.deal_sources;
DROP POLICY IF EXISTS "Users can delete their own deal sources" ON public.deal_sources;

CREATE POLICY "Users can view org deal sources"
ON public.deal_sources FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can insert org deal sources"
ON public.deal_sources FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can update org deal sources"
ON public.deal_sources FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can delete org deal sources"
ON public.deal_sources FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

-- Update campaigns policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

CREATE POLICY "Users can view org campaigns"
ON public.campaigns FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can insert org campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can update org campaigns"
ON public.campaigns FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can delete org campaigns"
ON public.campaigns FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

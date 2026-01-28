-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create an organization" ON organizations;

-- Create a new INSERT policy that allows returning the inserted row
-- The INSERT succeeds for authenticated users
-- We need to also allow SELECT of rows that were just inserted by the same user
CREATE POLICY "Authenticated users can create an organization" 
ON organizations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Add a temporary SELECT policy that allows users to see organizations 
-- they're the billing_email for (since we set billing_email = user.email during creation)
-- This enables the .select() after insert to work before membership is created
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

CREATE POLICY "Users can view their organizations" 
ON organizations 
FOR SELECT 
USING (
  is_org_member(id) 
  OR billing_email = auth.email()
);
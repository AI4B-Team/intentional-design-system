-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create an organization" ON public.organizations;

-- Create a new INSERT policy with proper role restriction
CREATE POLICY "Authenticated users can create an organization"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
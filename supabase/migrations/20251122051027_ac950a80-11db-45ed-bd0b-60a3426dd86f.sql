-- Drop the existing update policy
DROP POLICY IF EXISTS "Businesses update policy" ON public.businesses;

-- Create new policy that allows moderators to update status
CREATE POLICY "Businesses update policy" ON public.businesses
FOR UPDATE
USING (
  -- Owner can update their own business
  (auth.uid() = owner_id) 
  OR 
  -- Admin can update any business
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Moderator can update any business (for approval/rejection)
  has_role(auth.uid(), 'moderator'::app_role)
);
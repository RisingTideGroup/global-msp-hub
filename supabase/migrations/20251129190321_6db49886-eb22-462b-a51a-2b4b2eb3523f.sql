-- Update RLS policy to allow users to create classifications with 'approved' status
-- when the classification type allows user suggestions

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create classifications" ON public.classifications;

-- Create new policy that checks if the classification type allows user suggestions
CREATE POLICY "Authenticated users can create classifications" 
ON public.classifications 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND (
    -- Allow pending status for all authenticated users
    status = 'pending'
    OR
    -- Allow approved status only if the classification type allows user suggestions
    (
      status = 'approved' 
      AND EXISTS (
        SELECT 1 
        FROM classification_types 
        WHERE classification_types.name = classifications.type 
        AND classification_types.allow_user_suggestions = true
        AND classification_types.status = 'approved'
      )
    )
  )
);
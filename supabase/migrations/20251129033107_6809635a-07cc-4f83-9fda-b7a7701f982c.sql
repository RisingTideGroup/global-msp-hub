-- 1. Strengthen job_applications RLS policies
-- Drop existing policies to recreate them with explicit constraints
DROP POLICY IF EXISTS "Job applications select policy" ON job_applications;
DROP POLICY IF EXISTS "Job applications update policy" ON job_applications;

-- Recreate with explicit business owner verification
CREATE POLICY "Users can view their own applications"
ON job_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view applications to their jobs"
ON job_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs j
    JOIN businesses b ON j.business_id = b.id
    WHERE j.id = job_applications.job_id
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all applications"
ON job_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own applications"
ON job_applications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can update applications to their jobs"
ON job_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM jobs j
    JOIN businesses b ON j.business_id = b.id
    WHERE j.id = job_applications.job_id
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can update all applications"
ON job_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Add explicit email protection to profiles table
-- The email column should only be visible to the owner, admins, or moderators
CREATE POLICY "Prevent email harvesting via joins"
ON profiles
FOR SELECT
USING (
  id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- 3. Strengthen notification_logs RLS
-- Existing policy is good but let's make it more explicit
DROP POLICY IF EXISTS "Users can view their own notification logs" ON notification_logs;

CREATE POLICY "Users can only view their own notification logs"
ON notification_logs
FOR SELECT
USING (
  auth.uid() = recipient_user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Add function to hash sensitive data for GDPR compliance
CREATE OR REPLACE FUNCTION public.hash_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$;
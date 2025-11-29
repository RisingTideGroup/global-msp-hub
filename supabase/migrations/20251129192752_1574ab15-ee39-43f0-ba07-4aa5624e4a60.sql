-- Add malware tracking fields to job_applications
ALTER TABLE public.job_applications
ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending' CHECK (scan_status IN ('pending', 'clean', 'malicious', 'error')),
ADD COLUMN IF NOT EXISTS malware_detected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scan_error_message TEXT;

-- Update RLS policy to hide malicious applications from business owners
DROP POLICY IF EXISTS "Business owners can view applications to their jobs" ON public.job_applications;

CREATE POLICY "Business owners can view applications to their jobs"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM jobs j
      JOIN businesses b ON j.business_id = b.id
      WHERE j.id = job_applications.job_id 
      AND b.owner_id = auth.uid()
      AND job_applications.malware_detected = false  -- Hide malicious apps
    )
  );

-- Admins can still see all applications including malicious ones
-- (their existing policy already allows this)

-- Create index for filtering by scan status
CREATE INDEX IF NOT EXISTS idx_job_applications_scan_status ON public.job_applications(scan_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_malware_detected ON public.job_applications(malware_detected);
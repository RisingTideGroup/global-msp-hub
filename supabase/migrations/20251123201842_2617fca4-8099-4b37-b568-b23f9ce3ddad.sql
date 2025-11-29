-- Add resume_url and phone to job_applications table
ALTER TABLE public.job_applications
ADD COLUMN resume_url text,
ADD COLUMN phone text;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Business owners can view applicant resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  EXISTS (
    SELECT 1
    FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN businesses b ON b.id = j.business_id
    WHERE ja.resume_url = storage.objects.name
      AND b.owner_id = auth.uid()
  )
);
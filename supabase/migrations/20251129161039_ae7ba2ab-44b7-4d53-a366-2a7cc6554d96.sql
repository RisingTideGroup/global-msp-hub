-- Add DELETE policy for job_applications so users can cancel their own applications
CREATE POLICY "Users can delete their own applications"
ON job_applications
FOR DELETE
USING (auth.uid() = user_id);
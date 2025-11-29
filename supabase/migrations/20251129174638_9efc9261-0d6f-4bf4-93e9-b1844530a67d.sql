-- Add display_order field to classification_types for sequencing
ALTER TABLE classification_types 
ADD COLUMN display_order integer DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX idx_classification_types_display_order ON classification_types(display_order);

-- Migrate existing department data from jobs to job_classifications
INSERT INTO job_classifications (job_id, classification_type, classification_value)
SELECT id, 'Department', department
FROM jobs
WHERE department IS NOT NULL AND department != '';

-- Drop the department column from jobs table
ALTER TABLE jobs DROP COLUMN department;
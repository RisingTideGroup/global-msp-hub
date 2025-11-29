-- Add field_type column to classification_types
ALTER TABLE classification_types 
ADD COLUMN field_type text NOT NULL DEFAULT 'select';

-- Add check constraint for field_type
ALTER TABLE classification_types
ADD CONSTRAINT field_type_check CHECK (field_type IN ('text', 'select'));

-- Change display_order to jsonb to support per-use-case ordering
-- First, migrate existing data
ALTER TABLE classification_types 
ADD COLUMN display_order_new jsonb DEFAULT '{}'::jsonb;

-- Migrate existing display_order values to the new structure
-- For each row, if it has business use case, set {"business": display_order}
UPDATE classification_types
SET display_order_new = jsonb_build_object(
  CASE 
    WHEN 'business' = ANY(use_case) THEN 'business'
    WHEN 'job' = ANY(use_case) THEN 'job'
    ELSE 'business'
  END,
  COALESCE(display_order, 0)
)
WHERE display_order IS NOT NULL;

-- Drop old column and rename new one
ALTER TABLE classification_types DROP COLUMN display_order;
ALTER TABLE classification_types RENAME COLUMN display_order_new TO display_order;
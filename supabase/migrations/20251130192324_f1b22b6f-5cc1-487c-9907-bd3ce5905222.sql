-- Create categories table for managing link sections
CREATE TABLE public.msp_hub_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.msp_hub_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.msp_hub_categories
FOR SELECT
USING (is_active = true);

-- Authenticated users can view all categories
CREATE POLICY "Authenticated users can view all categories"
ON public.msp_hub_categories
FOR SELECT
TO authenticated
USING (true);

-- Admins and moderators can manage categories
CREATE POLICY "Admins and moderators can manage categories"
ON public.msp_hub_categories
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Create trigger for updated_at
CREATE TRIGGER update_msp_hub_categories_updated_at
BEFORE UPDATE ON public.msp_hub_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing categories from links
INSERT INTO public.msp_hub_categories (name, display_name, display_order)
SELECT DISTINCT 
  category as name,
  category as display_name,
  ROW_NUMBER() OVER (ORDER BY category) - 1 as display_order
FROM public.msp_hub_links
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;
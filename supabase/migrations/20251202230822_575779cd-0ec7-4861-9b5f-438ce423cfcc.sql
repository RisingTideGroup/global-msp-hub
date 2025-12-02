-- Allow creators to update their own links
CREATE POLICY "Creators can update their own links"
ON public.msp_hub_links
FOR UPDATE
USING (auth.uid() = created_by);

-- Allow creators to delete their own links
CREATE POLICY "Creators can delete their own links"
ON public.msp_hub_links
FOR DELETE
USING (auth.uid() = created_by);
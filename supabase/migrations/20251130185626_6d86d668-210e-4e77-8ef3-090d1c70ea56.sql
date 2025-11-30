-- Create links table for MSP Hub with prefix
CREATE TABLE IF NOT EXISTS public.msp_hub_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  description text,
  logo_url text,
  category text NOT NULL, -- 'community', 'discord', 'youtube', 'project'
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.msp_hub_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for msp_hub_links
-- Anyone can view active links
CREATE POLICY "Anyone can view active links"
ON public.msp_hub_links
FOR SELECT
USING (is_active = true);

-- Authenticated users can view all links (including inactive for admin panel)
CREATE POLICY "Authenticated users can view all links"
ON public.msp_hub_links
FOR SELECT
TO authenticated
USING (true);

-- All authenticated users can add links
CREATE POLICY "Authenticated users can add links"
ON public.msp_hub_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Only admins and moderators can update links
CREATE POLICY "Admins and moderators can update links"
ON public.msp_hub_links
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Only admins can delete links
CREATE POLICY "Admins can delete links"
ON public.msp_hub_links
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_msp_hub_links_updated_at
BEFORE UPDATE ON public.msp_hub_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing links from the current page
INSERT INTO public.msp_hub_links (title, url, description, category, display_order, logo_url) VALUES
-- MSP Communities
('MSPGeek', 'https://mspgeek.com', 'Connect with fellow MSP professionals', 'community', 1, 'https://mspgeek.com'),
('Tech Degenerates', 'https://techdegenerates.com', 'Join the tech community', 'community', 2, 'https://techdegenerates.com'),
('Reddit /r/msp', 'https://reddit.com/r/msp', 'MSP subreddit community', 'community', 3, 'https://reddit.com'),

-- Discord Communities
('Cyberdrain', 'https://discord.gg/cyberdrain', 'Join Cyberdrain Discord', 'discord', 1, 'https://cyberdrain.com'),
('MSPGeek Discord', 'https://discord.gg/mspgeek', 'MSPGeek Discord server', 'discord', 2, 'https://mspgeek.com'),
('Tech Degenerates Discord', 'https://discord.gg/techdegenerates', 'Tech Degenerates Discord server', 'discord', 3, 'https://techdegenerates.com'),
('HaloPSA Community', 'https://discord.gg/halopsa', 'HaloPSA Discord community', 'discord', 4, 'https://halopsa.com'),
('Hudu Community', 'https://discord.gg/hudu', 'Hudu Discord community', 'discord', 5, 'https://usehudu.com'),

-- YouTube Channels
('MSPGeek YouTube', 'https://youtube.com/@mspgeek', 'MSPGeek YouTube channel', 'youtube', 1, 'https://mspgeek.com'),
('John Hammond', 'https://youtube.com/@_JohnHammond', 'John Hammond YouTube channel', 'youtube', 2, 'https://youtube.com'),
('Tom Lawrence', 'https://youtube.com/@lawrencesystems', 'Lawrence Systems YouTube', 'youtube', 3, 'https://lawrencesystems.com'),

-- Projects
('JobMatch', 'https://jobs.globalmsphub.org', 'Find jobs that match your values. Connect with companies in the MSP/MSSP/TSP industry that prioritize culture, growth, and meaningful work.', 'project', 1, 'https://jobs.globalmsphub.org');
-- Create table for job visits tracking
CREATE TABLE IF NOT EXISTS public.job_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for business profile visits tracking
CREATE TABLE IF NOT EXISTS public.business_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_visits_job_id ON public.job_visits(job_id);
CREATE INDEX IF NOT EXISTS idx_job_visits_visited_at ON public.job_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_job_visits_ip_job ON public.job_visits(ip_address, job_id, visited_at);

CREATE INDEX IF NOT EXISTS idx_business_visits_business_id ON public.business_visits(business_id);
CREATE INDEX IF NOT EXISTS idx_business_visits_visited_at ON public.business_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_business_visits_ip_business ON public.business_visits(ip_address, business_id, visited_at);

-- RLS policies for job_visits
ALTER TABLE public.job_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track job visits"
  ON public.job_visits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can view their job visits"
  ON public.job_visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.businesses b ON j.business_id = b.id
      WHERE j.id = job_visits.job_id
      AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all job visits"
  ON public.job_visits
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for business_visits
ALTER TABLE public.business_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track business visits"
  ON public.business_visits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can view their business visits"
  ON public.business_visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_visits.business_id
      AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all business visits"
  ON public.business_visits
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
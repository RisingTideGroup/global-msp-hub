-- Create RPC functions to hash IP addresses in visit tracking tables
-- These are used during GDPR deletion to preserve analytics while anonymizing data

-- Function to hash IP addresses in business_visits for specific businesses
CREATE OR REPLACE FUNCTION public.hash_business_visit_ips(p_business_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE business_visits
  SET ip_address = hash_sensitive_data(ip_address)
  WHERE business_id = ANY(p_business_ids)
  AND ip_address NOT LIKE 'hashed_%'; -- Don't hash already hashed IPs
  
  RAISE NOTICE 'Hashed IP addresses for % businesses', array_length(p_business_ids, 1);
END;
$$;

-- Function to hash IP addresses in job_visits for specific jobs
CREATE OR REPLACE FUNCTION public.hash_job_visit_ips(p_job_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE job_visits
  SET ip_address = hash_sensitive_data(ip_address)
  WHERE job_id = ANY(p_job_ids)
  AND ip_address NOT LIKE 'hashed_%'; -- Don't hash already hashed IPs
  
  RAISE NOTICE 'Hashed IP addresses for % jobs', array_length(p_job_ids, 1);
END;
$$;

-- Grant execute permissions to authenticated users (edge functions run as service role)
GRANT EXECUTE ON FUNCTION public.hash_business_visit_ips(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hash_job_visit_ips(UUID[]) TO authenticated;
-- Fix search_path for hash_sensitive_data function
CREATE OR REPLACE FUNCTION public.hash_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$;
-- Create table for VirusTotal scan statistics
CREATE TABLE IF NOT EXISTS public.virustotal_scan_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  scan_result TEXT NOT NULL CHECK (scan_result IN ('clean', 'malicious', 'error')),
  positives INTEGER DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  error_message TEXT,
  quota_exceeded BOOLEAN DEFAULT false,
  response_code INTEGER
);

-- Enable RLS
ALTER TABLE public.virustotal_scan_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can view scan statistics
CREATE POLICY "Admins can view scan statistics"
  ON public.virustotal_scan_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_virustotal_scan_stats_created_at ON public.virustotal_scan_stats(created_at DESC);
CREATE INDEX idx_virustotal_scan_stats_result ON public.virustotal_scan_stats(scan_result);
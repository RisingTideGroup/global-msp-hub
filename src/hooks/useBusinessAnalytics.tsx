import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  totalApplications: number;
  conversionRate: number;
  visitsByDate: Array<{ date: string; visits: number }>;
  applicationsByDate: Array<{ date: string; applications: number }>;
  topJobs: Array<{
    jobId: string;
    jobTitle: string;
    visits: number;
    applications: number;
  }>;
}

export const useBusinessAnalytics = (businessId: string | undefined, days: number = 30) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['business-analytics', businessId, days],
    queryFn: async () => {
      if (!user || !businessId) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Get all jobs for this business
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('business_id', businessId);

      const jobIds = jobs?.map(j => j.id) || [];

      // Get business visits
      const { data: businessVisits } = await supabase
        .from('business_visits')
        .select('*')
        .eq('business_id', businessId)
        .gte('visited_at', startDateStr);

      // Get job visits
      const { data: jobVisits } = await supabase
        .from('job_visits')
        .select('*')
        .in('job_id', jobIds)
        .gte('visited_at', startDateStr);

      // Get applications
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', jobIds)
        .gte('applied_at', startDateStr);

      // Calculate total visits (business profile + all job postings)
      const totalVisits = (businessVisits?.length || 0) + (jobVisits?.length || 0);

      // Calculate unique visitors (unique IPs across all visits)
      const allVisits = [...(businessVisits || []), ...(jobVisits || [])];
      const uniqueIPs = new Set(allVisits.map(v => v.ip_address));
      const uniqueVisitors = uniqueIPs.size;

      // Total applications
      const totalApplications = applications?.length || 0;

      // Conversion rate (applications / job visits)
      const conversionRate = jobVisits && jobVisits.length > 0
        ? (totalApplications / jobVisits.length) * 100
        : 0;

      // Visits by date
      const visitsByDateMap = new Map<string, number>();
      allVisits.forEach(visit => {
        const date = new Date(visit.visited_at).toISOString().split('T')[0];
        visitsByDateMap.set(date, (visitsByDateMap.get(date) || 0) + 1);
      });
      const visitsByDate = Array.from(visitsByDateMap.entries())
        .map(([date, visits]) => ({ date, visits }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Applications by date
      const applicationsByDateMap = new Map<string, number>();
      applications?.forEach(app => {
        const date = new Date(app.applied_at).toISOString().split('T')[0];
        applicationsByDateMap.set(date, (applicationsByDateMap.get(date) || 0) + 1);
      });
      const applicationsByDate = Array.from(applicationsByDateMap.entries())
        .map(([date, applications]) => ({ date, applications }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top jobs by visits and applications
      const jobStatsMap = new Map<string, { title: string; visits: number; applications: number }>();
      
      jobs?.forEach(job => {
        jobStatsMap.set(job.id, { title: job.title, visits: 0, applications: 0 });
      });

      jobVisits?.forEach(visit => {
        const stats = jobStatsMap.get(visit.job_id);
        if (stats) stats.visits++;
      });

      applications?.forEach(app => {
        const stats = jobStatsMap.get(app.job_id);
        if (stats) stats.applications++;
      });

      const topJobs = Array.from(jobStatsMap.entries())
        .map(([jobId, stats]) => ({
          jobId,
          jobTitle: stats.title,
          visits: stats.visits,
          applications: stats.applications
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      const analyticsData: AnalyticsData = {
        totalVisits,
        uniqueVisitors,
        totalApplications,
        conversionRate,
        visitsByDate,
        applicationsByDate,
        topJobs
      };

      return analyticsData;
    },
    enabled: !!user && !!businessId
  });
};

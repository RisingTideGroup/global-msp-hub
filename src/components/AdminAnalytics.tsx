import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Briefcase, Building2, Eye, FileText } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

export const AdminAnalytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Fetch various stats
      const [
        businessesCount,
        jobsCount,
        applicationsCount,
        usersCount,
        recentVisits,
        notificationCount
      ] = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('job_visits').select('id', { count: 'exact', head: true }),
        supabase.from('notification_logs').select('id', { count: 'exact', head: true })
      ]);

      // Get pending businesses
      const { count: pendingBusinesses } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get active jobs
      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get recent applications (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentApplications } = await supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .gte('applied_at', sevenDaysAgo.toISOString());

      return {
        totalBusinesses: businessesCount.count || 0,
        totalJobs: jobsCount.count || 0,
        totalApplications: applicationsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalVisits: recentVisits.count || 0,
        totalNotifications: notificationCount.count || 0,
        pendingBusinesses: pendingBusinesses || 0,
        activeJobs: activeJobs || 0,
        recentApplications: recentApplications || 0
      };
    }
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  const metrics = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Registered users",
      color: "text-blue-600"
    },
    {
      title: "Total Businesses",
      value: stats?.totalBusinesses || 0,
      icon: Building2,
      description: `${stats?.pendingBusinesses || 0} pending approval`,
      color: "text-purple-600"
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      description: `${stats?.totalJobs || 0} total jobs`,
      color: "text-green-600"
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: FileText,
      description: `${stats?.recentApplications || 0} this week`,
      color: "text-orange-600"
    },
    {
      title: "Page Visits",
      value: stats?.totalVisits || 0,
      icon: Eye,
      description: "Job and business views",
      color: "text-pink-600"
    },
    {
      title: "Notifications Sent",
      value: stats?.totalNotifications || 0,
      icon: TrendingUp,
      description: "Email notifications",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary">Analytics Overview</h2>
          <p className="text-dark-text">System-wide metrics and statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brand-primary mb-1">
                  {metric.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">Average applications per job</span>
            <span className="text-lg font-bold text-blue-600">
              {stats?.totalJobs ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium">Average jobs per business</span>
            <span className="text-lg font-bold text-green-600">
              {stats?.totalBusinesses ? (stats.totalJobs / stats.totalBusinesses).toFixed(1) : 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium">Applications this week</span>
            <span className="text-lg font-bold text-purple-600">
              {stats?.recentApplications || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useBusinessAnalytics } from '@/hooks/useBusinessAnalytics';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Eye, Users, FileText, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessAnalyticsProps {
  businessId: string;
}

export const BusinessAnalytics = ({ businessId }: BusinessAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<number>(30);
  const { data: analytics, isLoading } = useBusinessAnalytics(businessId, timeRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Analytics</h2>
        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              Profile + Job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Unique IP addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Total applications received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Job views to applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visits" className="text-xs sm:text-sm">Visits</TabsTrigger>
          <TabsTrigger value="applications" className="text-xs sm:text-sm">Applications</TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs sm:text-sm">Top Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Visit Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.visitsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Visits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Application Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.applicationsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Top Performing Jobs</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topJobs.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="jobTitle" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" name="Visits" />
                  <Bar dataKey="applications" fill="hsl(var(--accent))" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topJobs.map((job) => (
                  <div key={job.jobId} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{job.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.visits} visits • {job.applications} applications
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {job.visits > 0 ? ((job.applications / job.visits) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

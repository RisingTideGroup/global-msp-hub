import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, ShieldAlert, AlertTriangle, FileCheck } from "lucide-react";

interface ScanStats {
  total: number;
  clean: number;
  malicious: number;
  errors: number;
  quota_exceeded: number;
  last_7_days: number;
}

export const VirusTotalStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["virustotal-stats"],
    queryFn: async (): Promise<ScanStats> => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("virustotal_scan_stats")
        .select("*");

      if (error) throw error;

      const recent = data.filter(
        (stat) => new Date(stat.created_at) >= sevenDaysAgo
      );

      return {
        total: data.length,
        clean: data.filter((s) => s.scan_result === "clean").length,
        malicious: data.filter((s) => s.scan_result === "malicious").length,
        errors: data.filter((s) => s.scan_result === "error").length,
        quota_exceeded: data.filter((s) => s.quota_exceeded).length,
        last_7_days: recent.length,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading statistics...</div>;
  }

  if (!stats) {
    return null;
  }

  const hasQuotaIssues = stats.quota_exceeded > 0;
  const cleanRate = stats.total > 0 ? ((stats.clean / stats.total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clean Files</p>
                <p className="text-2xl font-bold text-green-600">{stats.clean}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Malicious</p>
                <p className="text-2xl font-bold text-red-600">{stats.malicious}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-orange-600">{stats.errors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Clean Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{cleanRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.clean} out of {stats.total} files scanned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.last_7_days}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Scans in the past week
            </p>
          </CardContent>
        </Card>
      </div>

      {hasQuotaIssues && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>API Quota Issues Detected:</strong> {stats.quota_exceeded} scan(s) failed due to rate limits. 
            This may indicate you need to upgrade your VirusTotal API plan or that files are too large for the free tier.
          </AlertDescription>
        </Alert>
      )}

      {stats.errors > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Scan Errors:</strong> {stats.errors} scan(s) encountered errors. 
            Check the logs for more details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
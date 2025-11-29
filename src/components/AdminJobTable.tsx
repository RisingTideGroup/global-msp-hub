import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminJobs, useToggleJobStatus, useDeleteJob } from "@/hooks/useAdminJobs";
import { Trash2, Play, Pause } from "lucide-react";
import { AdminTableHeader } from "@/components/AdminTableHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const AdminJobTable = () => {
  const { data: jobs = [], isLoading } = useAdminJobs();
  const toggleStatus = useToggleJobStatus();
  const deleteJob = useDeleteJob();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.business.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && job.is_active) ||
      (statusFilter === "inactive" && !job.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (jobId: string, currentStatus: boolean) => {
    toggleStatus.mutate({ entityId: jobId, value: !currentStatus });
  };

  const handleDelete = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      deleteJob.mutate(jobId);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    } else if (min) {
      return `$${(min / 1000).toFixed(0)}k+`;
    }
    return 'Not specified';
  };

  const statusOptions = [
    { value: "all", label: "All Jobs" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  if (isLoading) {
    return <LoadingSpinner message="Loading jobs..." />;
  }

  return (
    <div className="space-y-6">
      <AdminTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search jobs..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterPlaceholder="Filter by status"
        filterOptions={statusOptions}
      />

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-800">{job.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.business.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {job.business.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">{job.job_type}</Badge>
                    <Badge variant="outline" className="text-xs block w-fit">{job.work_arrangement}</Badge>
                  </div>
                </TableCell>
                <TableCell>{formatSalary(job.salary_min, job.salary_max)}</TableCell>
                <TableCell>
                  {job.is_active ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(job.posted_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(job.id, job.is_active)}
                      disabled={toggleStatus.isPending}
                      className="flex items-center gap-1"
                    >
                      {job.is_active ? (
                        <>
                          <Pause className="h-3 w-3" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(job.id)}
                      disabled={deleteJob.isPending}
                      className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

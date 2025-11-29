import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessApplication } from "@/hooks/useBusinessApplications";
import { ApplicationDetailModal } from "./ApplicationDetailModal";
import { Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface BusinessApplicationsTableProps {
  applications: BusinessApplication[];
}

export const BusinessApplicationsTable = ({ applications }: BusinessApplicationsTableProps) => {
  const [selectedApplication, setSelectedApplication] = useState<BusinessApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredApplications = applications.filter(app => 
    statusFilter === "all" ? true : app.status === statusFilter
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'rejected': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'reviewed': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default: return '';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No applications found
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">
                      {application.applicant.first_name && application.applicant.last_name
                        ? `${application.applicant.first_name} ${application.applicant.last_name}`
                        : 'Anonymous'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.applicant.email || 'No email'}
                    </div>
                  </div>
                  <Badge 
                    variant={getStatusBadgeVariant(application.status)}
                    className={getStatusColor(application.status)}
                  >
                    {application.status}
                  </Badge>
                </div>
                 <div className="text-sm space-y-1">
                  <div><span className="font-medium">Job:</span> {application.job.title}</div>
                  <div><span className="font-medium">Location:</span> {application.job.location}</div>
                  <div><span className="font-medium">Applied:</span> {format(new Date(application.applied_at), 'MMM d, yyyy')}</div>
                  {application.scan_status === 'error' && application.resume_url && (
                    <div className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Security scan incomplete - review resume carefully</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedApplication(application)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.applicant.first_name && application.applicant.last_name
                            ? `${application.applicant.first_name} ${application.applicant.last_name}`
                            : 'Anonymous'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.applicant.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{application.job.title}</TableCell>
                    <TableCell>{application.job.location}</TableCell>
                    <TableCell>{format(new Date(application.applied_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={getStatusBadgeVariant(application.status)}
                          className={getStatusColor(application.status)}
                        >
                          {application.status}
                        </Badge>
                        {application.scan_status === 'error' && application.resume_url && (
                          <div className="text-amber-600 text-xs flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Scan incomplete</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          open={!!selectedApplication}
          onOpenChange={(open) => !open && setSelectedApplication(null)}
        />
      )}
    </>
  );
};
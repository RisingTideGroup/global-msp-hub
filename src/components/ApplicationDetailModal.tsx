import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BusinessApplication, useUpdateApplicationStatus } from "@/hooks/useBusinessApplications";
import { Download, Mail, Phone, MapPin, Briefcase, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { RichTextDisplay } from "@/components/RichTextDisplay";

interface ApplicationDetailModalProps {
  application: BusinessApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApplicationDetailModal = ({
  application,
  open,
  onOpenChange,
}: ApplicationDetailModalProps) => {
  const updateStatus = useUpdateApplicationStatus();
  const [downloading, setDownloading] = useState(false);

  const handleStatusUpdate = (status: 'reviewed' | 'accepted' | 'rejected') => {
    updateStatus.mutate({ applicationId: application.id, status });
  };

  const handleDownloadResume = async () => {
    if (!application.resume_url) return;
    
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(application.resume_url);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${application.applicant.first_name}-${application.applicant.last_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'rejected': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'reviewed': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Application Details</span>
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Warning for Scan Errors */}
          {application.scan_status === 'error' && application.resume_url && (
            <Alert variant="default" className="border-amber-500 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Security Scan Incomplete:</strong> The automated malware scan could not complete for this application's resume. 
                Please exercise extra caution when downloading and opening the file. Consider using additional security tools to scan the file before opening.
                {application.scan_error_message && (
                  <div className="mt-2 text-sm">
                    Error: {application.scan_error_message}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Applicant Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Applicant Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Name:</span>
                <span>
                  {application.applicant.first_name && application.applicant.last_name
                    ? `${application.applicant.first_name} ${application.applicant.last_name}`
                    : 'Anonymous'}
                </span>
              </div>
              {application.applicant.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${application.applicant.email}`}
                    className="text-primary hover:underline"
                  >
                    {application.applicant.email}
                  </a>
                </div>
              )}
              {application.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${application.phone}`}
                    className="text-primary hover:underline"
                  >
                    {application.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Position Applied For</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{application.job.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{application.job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Applied on {format(new Date(application.applied_at), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resume */}
          {application.resume_url && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Resume</h3>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadResume}
                  disabled={downloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download Resume'}
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Cover Letter</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <RichTextDisplay content={application.cover_letter || ""} className="text-sm" />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Status Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Update Status</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('reviewed')}
                disabled={updateStatus.isPending || application.status === 'reviewed'}
              >
                Mark as Reviewed
              </Button>
              <Button
                variant="default"
                onClick={() => handleStatusUpdate('accepted')}
                disabled={updateStatus.isPending || application.status === 'accepted'}
                className="bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updateStatus.isPending || application.status === 'rejected'}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
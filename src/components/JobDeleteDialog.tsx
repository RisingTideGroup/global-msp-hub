
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useDeleteJob, type BusinessJobsJob } from "@/hooks/useBusinessJobs";
import { useToast } from "@/hooks/use-toast";

interface JobDeleteDialogProps {
  job: BusinessJobsJob | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobDeleteDialog = ({ job, onClose, onSuccess }: JobDeleteDialogProps) => {
  const { toast } = useToast();
  const deleteJob = useDeleteJob();
  const [confirmationText, setConfirmationText] = useState("");
  
  const handleDelete = async () => {
    if (!job || confirmationText !== "DELETE") return;

    try {
      await deleteJob.mutateAsync(job.id);
      
      toast({
        title: "Job Deleted",
        description: "The job posting has been permanently deleted.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  if (!job) return null;

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-red-900">Delete Job Posting</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">⚠️ This action is permanent</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• The job posting "{job.title}" will be permanently deleted</li>
              <li>• All associated applications will be deleted</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>
          
          <div>
            <Label htmlFor="confirm" className="text-sm font-medium text-gray-900">
              Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
            </Label>
            <Input
              id="confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE here"
              className="mt-2"
            />
          </div>
        </AlertDialogDescription>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmationText !== "DELETE" || deleteJob.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteJob.isPending ? "Deleting..." : "Delete Job"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

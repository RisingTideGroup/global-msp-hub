
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JobForm } from "@/components/JobForm";
import { Job } from "@/hooks/useJobs";
import { BusinessJobsJob } from "@/hooks/useBusinessJobs";
import { useSaveJobClassifications } from "@/hooks/useJobClassifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface JobEditModalProps {
  job: Job | BusinessJobsJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string;
}

export const JobEditModal = ({ job, open, onOpenChange, businessId }: JobEditModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const saveClassifications = useSaveJobClassifications();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const jobData = {
        title: data.title,
        description: data.description,
        description_rich: data.description_rich,
        requirements: data.requirements,
        requirements_rich: data.requirements_rich,
        benefits: data.benefits,
        benefits_rich: data.benefits_rich,
        location: data.location,
        job_type: data.job_type,
        work_arrangement: data.work_arrangement,
        salary_min: data.salary_min ? parseInt(data.salary_min) : null,
        salary_max: data.salary_max ? parseInt(data.salary_max) : null,
      };

      if (job) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id);
        if (error) throw error;
        return job.id;
      } else {
        // For new jobs, we need to include business_id
        const jobDataWithBusinessId = {
          ...jobData,
          business_id: businessId || job?.business?.id || '',
        };
        
        const { data: newJob, error } = await supabase
          .from('jobs')
          .insert(jobDataWithBusinessId)
          .select()
          .maybeSingle();
        if (error || !newJob) throw error || new Error('Failed to create job');
        return newJob.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: job ? "Job updated" : "Job created",
        description: job ? "The job posting has been updated." : "The job posting has been created.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (formData: any, classifications?: Record<string, string>) => {
    try {
      const jobId = await mutation.mutateAsync(formData);
      
      // Save classifications if provided
      if (classifications && Object.keys(classifications).length > 0) {
        await saveClassifications.mutateAsync({
          jobId,
          classifications
        });
      }
    } catch (error) {
      console.error('Failed to save job and classifications:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job" : "Create New Job"}</DialogTitle>
        </DialogHeader>

        <JobForm
          job={job}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={mutation.isPending || saveClassifications.isPending}
          submitText={job ? "Update Job" : "Create Job"}
        />
      </DialogContent>
    </Dialog>
  );
};

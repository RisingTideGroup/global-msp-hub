
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Job } from "@/hooks/useJobs";
import { useApplyToJob } from "@/hooks/useApplications";
import { RichTextDisplay } from "@/components/RichTextDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { applicationSchema, MAX_LENGTHS, MAX_FILE_SIZE } from "@/lib/validations/application";

interface JobApplicationModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobApplicationModal = ({ job, open, onOpenChange }: JobApplicationModalProps) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const applyToJob = useApplyToJob();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const result = applicationSchema.safeParse({
      phone,
      coverLetter,
      resume: resume || undefined
    });
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      });
      return;
    }

    setValidationErrors({});
    let resumeUrl: string | undefined;
    
    if (resume) {
      setUploading(true);
      try {
        // Upload resume to storage (scan happens in background after application is created)
        const fileExt = resume.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resume);

        if (uploadError) throw uploadError;
        
        resumeUrl = fileName;
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload resume",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    applyToJob.mutate(
      { jobId: job.id, coverLetter, phone, resumeUrl },
      {
        onSuccess: () => {
          onOpenChange(false);
          setCoverLetter("");
          setPhone("");
          setResume(null);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Apply for {job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">{job.business.name}</h4>
            <p className="text-xs sm:text-sm text-slate-600 mb-3">{job.location} • {job.work_arrangement}</p>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-slate-700 mb-2">Job Description</h5>
                <RichTextDisplay 
                  content={job.description_rich || job.description} 
                  fallback={job.description}
                  className="text-sm text-slate-600 bg-white p-3 rounded border max-h-32 overflow-y-auto"
                />
              </div>
              
              {(job.requirements || job.requirements_rich) && (
                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Requirements</h5>
                  <RichTextDisplay 
                    content={job.requirements_rich || job.requirements || ""} 
                    fallback={job.requirements || ""}
                    className="text-sm text-slate-600 bg-white p-3 rounded border max-h-32 overflow-y-auto"
                  />
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`mt-1 ${validationErrors.phone ? "border-destructive" : ""}`}
                maxLength={MAX_LENGTHS.phone}
                required
              />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-destructive">{validationErrors.phone}</span>
                <span className="text-muted-foreground">{phone.length}/{MAX_LENGTHS.phone}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="resume">Resume (Optional)</Label>
              <div className="mt-1">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
                {resume && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-primary flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      {resume.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
                {validationErrors.resume && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.resume}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="coverLetter">Cover Letter <span className="text-destructive">*</span></Label>
              <RichTextEditor
                value={coverLetter}
                onChange={setCoverLetter}
                placeholder="Tell the employer why you're interested in this position and how your skills and experience make you a great fit..."
                className="mt-1"
                height="200px"
                aiCoachingType="cover_letter"
                businessContext={{
                  jobTitle: job.title,
                  businessName: job.business.name,
                  location: job.location,
                  jobDescription: job.description,
                  requirements: job.requirements
                }}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-destructive">{validationErrors.coverLetter}</span>
                <span className="text-muted-foreground">{coverLetter.length}/{MAX_LENGTHS.coverLetter}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={applyToJob.isPending || uploading}
                className="w-full sm:w-auto bg-rising-blue-700 hover:bg-rising-blue-800"
              >
                {uploading ? "Uploading..." : applyToJob.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

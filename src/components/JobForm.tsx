import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ClassificationSelect } from "@/components/ClassificationSelect";
import { useClassificationTypes } from "@/hooks/useClassificationTypes";
import { useClassifications } from "@/hooks/useClassifications";
import { useJobClassifications } from "@/hooks/useJobClassifications";
import { Job } from "@/hooks/useJobs";
import { BusinessJobsJob } from "@/hooks/useBusinessJobs";
import { useToast } from "@/hooks/use-toast";
import { jobSchema, MAX_LENGTHS } from "@/lib/validations/job";

interface JobFormData {
  title: string;
  description: string;
  description_rich: string;
  requirements: string;
  requirements_rich: string;
  benefits: string;
  benefits_rich: string;
  location: string;
  job_type: string;
  work_arrangement: string;
  salary_min: string;
  salary_max: string;
  // Dynamic fields for classifications
  [key: string]: string;
}

interface JobFormProps {
  job?: Job | BusinessJobsJob | null;
  onSubmit: (data: JobFormData, classifications?: Record<string, string>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
  showCancel?: boolean;
}

export const JobForm = ({ 
  job, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  submitText = "Submit",
  showCancel = true
}: JobFormProps) => {
  const { toast } = useToast();
  // Get all classification types that should appear on job forms
  const { data: classificationTypes = [] } = useClassificationTypes();
  const { data: allClassifications = [] } = useClassifications();
  
  // Get existing classifications for this job
  const { data: existingClassifications = [] } = useJobClassifications(job?.id);
  
  // Filter to only job-related types and sort by display order
  // Include text fields always, select fields only if they have options
  const jobClassificationTypes = classificationTypes
    .filter(type => {
      if (!type.use_case.includes('job')) return false;
      if (type.field_type === 'text') return true;
      // For select fields, only include if there are classification options
      return allClassifications.some(c => c.type === type.name && c.use_case.includes('job'));
    })
    .sort((a, b) => {
      const orderA = a.display_order?.['job'] || 0;
      const orderB = b.display_order?.['job'] || 0;
      return orderA - orderB;
    });
  
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    description_rich: "",
    requirements: "",
    requirements_rich: "",
    benefits: "",
    benefits_rich: "",
    location: "",
    job_type: "Full-time",
    work_arrangement: "On-site",
    salary_min: "",
    salary_max: "",
  });

  // Track classification values separately
  const [classificationValues, setClassificationValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        description_rich: job.description_rich || "",
        requirements: job.requirements || "",
        requirements_rich: job.requirements_rich || "",
        benefits: job.benefits || "",
        benefits_rich: job.benefits_rich || "",
        location: job.location || "",
        job_type: job.job_type || "Full-time",
        work_arrangement: job.work_arrangement || "On-site",
        salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "",
      });
    }
  }, [job]);

  // Load existing classifications when they're available
  useEffect(() => {
    console.log('JobForm: Loading existing classifications', existingClassifications);
    if (existingClassifications.length > 0) {
      const classificationMap = existingClassifications.reduce((acc, classification) => {
        acc[classification.classification_type] = classification.classification_value;
        return acc;
      }, {} as Record<string, string>);
      console.log('JobForm: Setting classification values to', classificationMap);
      setClassificationValues(classificationMap);
    }
  }, [existingClassifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const result = jobSchema.safeParse(formData);
    
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
    // Pass both form data and classifications
    onSubmit(formData, classificationValues);
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    console.log('JobForm: Updating field', field, 'with value', value);
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleClassificationChange = (type: string, value: string) => {
    console.log('JobForm: Updating classification', type, 'with value', value);
    setClassificationValues(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            maxLength={MAX_LENGTHS.title}
            className={validationErrors.title ? "border-destructive" : ""}
            required
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-destructive">{validationErrors.title}</span>
            <span className="text-muted-foreground">{formData.title.length}/{MAX_LENGTHS.title}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            maxLength={MAX_LENGTHS.location}
            className={validationErrors.location ? "border-destructive" : ""}
            required
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-destructive">{validationErrors.location}</span>
            <span className="text-muted-foreground">{formData.location.length}/{MAX_LENGTHS.location}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="job_type">Job Type</Label>
          <Select value={formData.job_type} onValueChange={(value) => handleInputChange("job_type", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="work_arrangement">Work Arrangement</Label>
          <Select value={formData.work_arrangement} onValueChange={(value) => handleInputChange("work_arrangement", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="On-site">On-site</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="salary_min">Minimum Salary</Label>
          <Input
            id="salary_min"
            type="number"
            value={formData.salary_min}
            onChange={(e) => handleInputChange("salary_min", e.target.value)}
            placeholder="e.g., 50000"
            className={validationErrors.salary_min ? "border-destructive" : ""}
          />
          {validationErrors.salary_min && (
            <p className="text-xs text-destructive mt-1">{validationErrors.salary_min}</p>
          )}
        </div>

        <div>
          <Label htmlFor="salary_max">Maximum Salary</Label>
          <Input
            id="salary_max"
            type="number"
            value={formData.salary_max}
            onChange={(e) => handleInputChange("salary_max", e.target.value)}
            placeholder="e.g., 80000"
            className={validationErrors.salary_max ? "border-destructive" : ""}
          />
          {validationErrors.salary_max && (
            <p className="text-xs text-destructive mt-1">{validationErrors.salary_max}</p>
          )}
        </div>
      </div>

      {/* Dynamic Classification Fields */}
      {jobClassificationTypes.map((classificationType) => {
        const currentValue = classificationValues[classificationType.name] || "";
        console.log(`JobForm: Rendering ${classificationType.name} field with value:`, currentValue);
        return (
          <div key={classificationType.id}>
            <ClassificationSelect
              value={currentValue}
              onValueChange={(value) => handleClassificationChange(classificationType.name, value)}
              type={classificationType.name}
              useCase="job"
              label={classificationType.name}
              placeholder={`${classificationType.field_type === 'text' ? 'Enter' : 'Select'} ${classificationType.name.toLowerCase()}`}
            />
          </div>
        );
      })}

      <div>
        <Label htmlFor="description">Job Description</Label>
        <RichTextEditor
          value={formData.description_rich || formData.description}
          onChange={(value) => {
            handleInputChange("description_rich", value);
            // Keep plain text version for search/fallback
            const plainText = value.replace(/<[^>]*>/g, '').trim();
            handleInputChange("description", plainText);
          }}
          placeholder="Describe the role, responsibilities, and what makes this position exciting..."
          height="200px"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-destructive">{validationErrors.description_rich || validationErrors.description}</span>
          <span className="text-muted-foreground">{formData.description_rich.length}/{MAX_LENGTHS.description_rich}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="requirements">Requirements</Label>
        <RichTextEditor
          value={formData.requirements_rich || formData.requirements}
          onChange={(value) => {
            handleInputChange("requirements_rich", value);
            // Keep plain text version for search/fallback
            const plainText = value.replace(/<[^>]*>/g, '').trim();
            handleInputChange("requirements", plainText);
          }}
          placeholder="List the required skills, experience, and qualifications..."
          height="150px"
        />
        <div className="flex justify-end text-xs mt-1">
          <span className="text-muted-foreground">{formData.requirements_rich.length}/{MAX_LENGTHS.requirements_rich}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="benefits">Benefits</Label>
        <RichTextEditor
          value={formData.benefits_rich || formData.benefits}
          onChange={(value) => {
            handleInputChange("benefits_rich", value);
            // Keep plain text version for search/fallback
            const plainText = value.replace(/<[^>]*>/g, '').trim();
            handleInputChange("benefits", plainText);
          }}
          placeholder="Highlight the benefits, perks, and compensation package..."
          height="150px"
        />
        <div className="flex justify-end text-xs mt-1">
          <span className="text-muted-foreground">{formData.benefits_rich.length}/{MAX_LENGTHS.benefits_rich}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {showCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
};

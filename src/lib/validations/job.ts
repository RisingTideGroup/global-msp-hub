import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Job title is required")
    .max(200, "Job title must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s\-/,().&]+$/, "Job title contains invalid characters"),
  
  location: z.string()
    .trim()
    .min(1, "Location is required")
    .max(200, "Location must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s,.\-()]+$/, "Location contains invalid characters"),
  
  job_type: z.enum(["Full-time", "Part-time", "Contract", "Internship"], {
    required_error: "Job type is required"
  }),
  
  work_arrangement: z.enum(["On-site", "Remote", "Hybrid"], {
    required_error: "Work arrangement is required"
  }),
  
  salary_min: z.string()
    .regex(/^\d*$/, "Salary must be a valid number")
    .optional()
    .or(z.literal("")),
  
  salary_max: z.string()
    .regex(/^\d*$/, "Salary must be a valid number")
    .optional()
    .or(z.literal("")),
  
  description: z.string()
    .min(1, "Job description is required")
    .max(5000, "Description must be less than 5000 characters"),
  
  description_rich: z.string()
    .max(10000, "Description must be less than 10000 characters")
    .optional(),
  
  requirements: z.string()
    .max(3000, "Requirements must be less than 3000 characters")
    .optional(),
  
  requirements_rich: z.string()
    .max(7000, "Requirements must be less than 7000 characters")
    .optional(),
  
  benefits: z.string()
    .max(2000, "Benefits must be less than 2000 characters")
    .optional(),
  
  benefits_rich: z.string()
    .max(5000, "Benefits must be less than 5000 characters")
    .optional(),
}).refine((data) => {
  if (data.salary_min && data.salary_max) {
    const min = parseInt(data.salary_min);
    const max = parseInt(data.salary_max);
    return max >= min;
  }
  return true;
}, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salary_max"]
});

export type JobFormValidation = z.infer<typeof jobSchema>;

export const MAX_LENGTHS = {
  title: 200,
  location: 200,
  description_plain: 5000,
  description_rich: 10000,
  requirements_plain: 3000,
  requirements_rich: 7000,
  benefits_plain: 2000,
  benefits_rich: 5000,
} as const;

import { z } from 'zod';

const phoneRegex = /^[\d\s\-+()]+$/;

export const applicationSchema = z.object({
  phone: z.string()
    .trim()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be less than 20 characters")
    .regex(phoneRegex, "Invalid phone number format"),
  
  coverLetter: z.string()
    .trim()
    .min(1, "Cover letter is required")
    .max(5000, "Cover letter must be less than 5000 characters"),
  
  resume: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB
    }, "Resume file must be less than 5MB")
    .refine((file) => {
      if (!file) return true;
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type);
    }, "Resume must be a PDF, DOC, or DOCX file"),
});

export type ApplicationFormValidation = z.infer<typeof applicationSchema>;

export const MAX_LENGTHS = {
  phone: 20,
  coverLetter: 5000,
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

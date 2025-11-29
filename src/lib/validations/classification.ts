import { z } from "zod";

// Classification validation schema
export const classificationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Classification name is required")
    .max(100, "Classification name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&().]+$/, "Only letters, numbers, spaces, and basic punctuation allowed"),
  type: z.string().min(1, "Classification type is required"),
  use_case: z.array(z.string()).min(1, "At least one use case is required"),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

// Classification type validation schema
export const classificationTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Type name is required")
    .max(50, "Type name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Only letters, numbers, spaces, and hyphens allowed"),
  use_case: z
    .array(z.string())
    .min(1, "At least one use case must be selected"),
  status: z.enum(['pending', 'approved', 'rejected']),
  allow_user_suggestions: z.boolean(),
  field_type: z.enum(['text', 'select']),
  display_order: z.record(z.string(), z.number().min(0).max(999))
});

export type ClassificationInput = z.infer<typeof classificationSchema>;
export type ClassificationTypeInput = z.infer<typeof classificationTypeSchema>;

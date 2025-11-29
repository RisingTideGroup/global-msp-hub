import { z } from 'zod';

const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const businessSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Company name is required")
    .max(200, "Company name must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s\-&.,()]+$/, "Company name contains invalid characters"),
  
  description: z.string()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  
  description_rich: z.string()
    .max(10000, "Description must be less than 10000 characters")
    .optional(),
  
  industry: z.string()
    .min(1, "Industry is required")
    .max(100, "Industry must be less than 100 characters"),
  
  company_size: z.string()
    .max(50, "Company size must be less than 50 characters")
    .optional(),
  
  location: z.string()
    .max(200, "Location must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s,.\-()]+$/, "Location contains invalid characters")
    .optional(),
  
  website: z.string()
    .trim()
    .max(500, "Website URL must be less than 500 characters")
    .regex(urlRegex, "Invalid website URL format")
    .optional()
    .or(z.literal("")),
  
  careers_page_url: z.string()
    .trim()
    .max(500, "Careers page URL must be less than 500 characters")
    .regex(urlRegex, "Invalid careers page URL format")
    .optional()
    .or(z.literal("")),
  
  mission: z.string()
    .max(2000, "Mission must be less than 2000 characters")
    .optional(),
  
  mission_rich: z.string()
    .max(5000, "Mission must be less than 5000 characters")
    .optional(),
  
  culture: z.string()
    .max(2000, "Culture description must be less than 2000 characters")
    .optional(),
  
  culture_rich: z.string()
    .max(5000, "Culture description must be less than 5000 characters")
    .optional(),
  
  benefits: z.string()
    .max(2000, "Benefits must be less than 2000 characters")
    .optional(),
  
  benefits_rich: z.string()
    .max(5000, "Benefits must be less than 5000 characters")
    .optional(),
  
  values: z.array(
    z.string()
      .trim()
      .min(1, "Value cannot be empty")
      .max(100, "Each value must be less than 100 characters")
  ).max(20, "Maximum 20 values allowed"),
  
  logo_url: z.string()
    .max(2000, "Logo URL is too long")
    .optional(),
});

export type BusinessFormValidation = z.infer<typeof businessSchema>;

export const MAX_LENGTHS = {
  name: 200,
  description_plain: 5000,
  description_rich: 10000,
  location: 200,
  website: 500,
  careers_page_url: 500,
  mission_plain: 2000,
  mission_rich: 5000,
  culture_plain: 2000,
  culture_rich: 5000,
  benefits_plain: 2000,
  benefits_rich: 5000,
  value: 100,
  max_values: 20,
} as const;

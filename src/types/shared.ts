
export interface BaseBusiness {
  id: string;
  name: string;
  description: string | null;
  description_rich: string | null;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  website: string | null;
  mission: string | null;
  mission_rich: string | null;
  culture: string | null;
  culture_rich: string | null;
  values: string[] | null;
  benefits: string | null;
  benefits_rich: string | null;
  logo_url: string | null;
  careers_page_url: string | null;
  coaching_mode: boolean | null;
  wizard_completed: boolean | null;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  owner_id: string;
  business_classifications?: Array<{
    classification_type: string;
    classification_value: string;
  }>;
}

// Export Business type for backward compatibility
export type Business = BaseBusiness;

export interface BaseJob {
  id: string;
  title: string;
  description: string;
  description_rich: string | null;
  requirements: string | null;
  requirements_rich: string | null;
  location: string;
  job_type: string;
  work_arrangement: string;
  salary_min: number | null;
  salary_max: number | null;
  benefits: string | null;
  benefits_rich: string | null;
  posted_at: string;
  is_active: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
}

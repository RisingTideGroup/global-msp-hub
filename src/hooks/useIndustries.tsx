
import { useClassifications, useAdminClassifications, useCreateClassification, useUpdateClassificationStatus, useDeleteClassification } from "@/hooks/useClassifications";

// Legacy exports that now use the classifications system
export const useIndustries = () => useClassifications('Industry', 'business');
export const useAdminIndustries = () => useAdminClassifications();
export const useCreateIndustry = () => {
  const createClassification = useCreateClassification();
  return {
    ...createClassification,
    mutate: (name: string, options?: any) => 
      createClassification.mutate({ 
        name, 
        type: 'Industry', 
        use_case: ['business', 'job'] 
      }, options)
  };
};
export const useUpdateIndustryStatus = useUpdateClassificationStatus;
export const useDeleteIndustry = useDeleteClassification;

// Re-export the Industry interface from classifications
export type { Classification as Industry } from "@/hooks/useClassifications";

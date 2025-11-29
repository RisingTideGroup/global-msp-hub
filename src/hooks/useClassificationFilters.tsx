import { useMemo } from "react";
import { useClassificationTypes } from "./useClassificationTypes";
import { FilterOption } from "@/types/shared";

interface ClassificationFilterData {
  type: string;
  options: FilterOption[];
  placeholder: string;
}

export const useClassificationFilters = (
  useCase: 'business' | 'job',
  items: any[]
) => {
  const { data: classificationTypes = [] } = useClassificationTypes();

  const classificationFilters = useMemo(() => {
    // Filter classification types by use case and sort by display_order for this use case
    const relevantTypes = classificationTypes
      .filter(type => 
        type.use_case.includes(useCase) && type.status === 'approved'
      )
      .sort((a, b) => {
        const orderA = a.display_order?.[useCase] || 0;
        const orderB = b.display_order?.[useCase] || 0;
        return orderA - orderB;
      });

    return relevantTypes.map(type => {
      // Extract unique classification values for this type from the items
      const uniqueValues = new Set<string>();
      
      items.forEach(item => {
        const classifications = useCase === 'business' 
          ? item.business_classifications 
          : item.job_classifications;
        
        if (classifications) {
          classifications.forEach((classification: any) => {
            if (classification.classification_type === type.name) {
              uniqueValues.add(classification.classification_value);
            }
          });
        }
      });

      const options: FilterOption[] = [
        { value: "all", label: `All ${type.name}` },
        ...Array.from(uniqueValues).sort().map(value => ({
          value,
          label: value
        }))
      ];

      return {
        type: type.name,
        options,
        placeholder: type.name
      };
    });
  }, [classificationTypes, items, useCase]);

  return classificationFilters;
};

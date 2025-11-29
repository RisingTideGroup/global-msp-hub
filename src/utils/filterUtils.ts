
export const createGenericFilter = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  filters: Array<{
    value: string;
    field: keyof T;
    matchFn?: (itemValue: any, filterValue: string) => boolean;
  }>,
  classificationFilters?: Record<string, string>
) => {
  return items.filter(item => {
    const matchesSearch = !searchTerm || 
      searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    
    const matchesFilters = filters.every(filter => {
      if (filter.value === "all") return true;
      
      const itemValue = item[filter.field];
      if (filter.matchFn) {
        return filter.matchFn(itemValue, filter.value);
      }
      
      return itemValue && String(itemValue).toLowerCase().includes(filter.value.toLowerCase());
    });

    // Check classification filters
    let matchesClassifications = true;
    if (classificationFilters) {
      matchesClassifications = Object.entries(classificationFilters).every(([type, value]) => {
        if (value === "all") return true;
        
        // Check if item has classifications
        const itemClassifications = (item as any).business_classifications || (item as any).job_classifications;
        if (!itemClassifications || !Array.isArray(itemClassifications)) return false;
        
        return itemClassifications.some((classification: any) => 
          classification.classification_type === type && 
          classification.classification_value === value
        );
      });
    }

    return matchesSearch && matchesFilters && matchesClassifications;
  });
};

export const extractUniqueOptions = <T>(
  items: T[],
  field: keyof T,
  allLabel: string = "All"
): Array<{ value: string; label: string }> => {
  const uniqueValues = [...new Set(
    items.map(item => item[field]).filter(Boolean)
  )];
  
  return [
    { value: "all", label: allLabel },
    ...uniqueValues.map(value => ({ 
      value: String(value), 
      label: String(value) 
    }))
  ];
};

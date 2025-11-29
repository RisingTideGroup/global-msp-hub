import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { FilterOption } from "@/types/shared";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  primaryFilter: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: FilterOption[];
  };
  secondaryFilter: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: FilterOption[];
    showLocationIcon?: boolean;
  };
  classificationFilters?: Array<{
    type: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: FilterOption[];
  }>;
}

export const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  primaryFilter,
  secondaryFilter,
  classificationFilters = []
}: SearchFilterBarProps) => {
  const hasClassificationFilters = classificationFilters.length > 0;
  const totalFilters = 2 + classificationFilters.length;
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-rising-blue-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`relative ${hasClassificationFilters ? 'md:col-span-4' : 'md:col-span-2'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 border-slate-200"
          />
        </div>
      </div>
      
      {/* Second row with all filters */}
      <div className={`grid grid-cols-1 gap-4 mt-4 ${
        hasClassificationFilters 
          ? `md:grid-cols-${Math.min(totalFilters, 4)}` 
          : 'md:grid-cols-2'
      }`}>
        <Select value={primaryFilter.value} onValueChange={primaryFilter.onChange}>
          <SelectTrigger className="h-12 border-slate-200">
            <SelectValue placeholder={primaryFilter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {primaryFilter.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="relative">
          {secondaryFilter.showLocationIcon && (
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none z-10" />
          )}
          <Select value={secondaryFilter.value} onValueChange={secondaryFilter.onChange}>
            <SelectTrigger className={`h-12 border-slate-200 ${secondaryFilter.showLocationIcon ? 'pl-10' : ''}`}>
              <SelectValue placeholder={secondaryFilter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {secondaryFilter.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classification Filters */}
        {classificationFilters.map((filter) => (
          <Select key={filter.type} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="h-12 border-slate-200">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilter {
  key: string;
  label: string;
  value: string;
}

interface SearchEnhancedProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  filters?: SearchFilter[];
  onFilterChange?: (filters: SearchFilter[]) => void;
  onClearAll?: () => void;
  className?: string;
}

export const SearchEnhanced = ({
  value,
  onChange,
  placeholder = "Search...",
  suggestions = [],
  filters = [],
  onFilterChange,
  onClearAll,
  className
}: SearchEnhancedProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const removeFilter = (filterToRemove: SearchFilter) => {
    if (onFilterChange) {
      onFilterChange(filters.filter(f => f.key !== filterToRemove.key));
    }
  };

  const hasActiveFilters = filters.length > 0 || value.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span className="text-xs text-gray-600">{filter.label}:</span>
              {filter.value}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && onClearAll && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

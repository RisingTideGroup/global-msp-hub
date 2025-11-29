
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface AdminTableHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterPlaceholder?: string;
  filterOptions: FilterOption[];
  hideSearch?: boolean;
}

export const AdminTableHeader = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterPlaceholder = "Filter...",
  filterOptions,
  hideSearch = false
}: AdminTableHeaderProps) => {
  return (
    <div className="flex gap-4">
      {!hideSearch && (
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      )}
      
      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={filterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

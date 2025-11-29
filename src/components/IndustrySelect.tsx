
import { ClassificationSelect } from "./ClassificationSelect";

interface IndustrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const IndustrySelect = ({ value, onValueChange, placeholder = "Select industry", required = false }: IndustrySelectProps) => {
  return (
    <ClassificationSelect
      value={value}
      onValueChange={onValueChange}
      type="Industry"
      useCase="business"
      placeholder={placeholder}
      required={required}
    />
  );
};

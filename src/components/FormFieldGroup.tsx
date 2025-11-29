
import { ReactNode } from "react";

interface FormFieldGroupProps {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export const FormFieldGroup = ({ 
  children, 
  columns = 2, 
  className = "" 
}: FormFieldGroupProps) => {
  const gridClass = columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  
  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>
      {children}
    </div>
  );
};

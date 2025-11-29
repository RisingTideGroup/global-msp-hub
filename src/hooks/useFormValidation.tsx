
import { useState, useCallback } from 'react';
import { z } from 'zod';

type ValidationErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>({
  schema,
  validateOnChange = true,
  validateOnBlur = true
}: UseFormValidationOptions<T>) => {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  const validateField = useCallback((name: keyof T, value: any) => {
    try {
      // Try to validate the full object with just this field
      // We'll catch the specific field error if validation fails
      const testData = { [name]: value } as any;
      
      // Parse just this field by trying to validate a minimal object
      // This is a simplified approach that works with most Zod schemas
      const result = schema.safeParse(testData);
      
      if (result.success) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return true;
      } else {
        // Find error specific to this field
        const fieldError = result.error.errors.find(err => 
          err.path.length === 0 || err.path.includes(name as string)
        );
        const errorMessage = fieldError?.message || 'Invalid value';
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
        return false;
      }
    } catch (error) {
      // Fallback error handling
      setErrors(prev => ({ ...prev, [name]: 'Invalid value' }));
      return false;
    }
  }, [schema]);

  const validateAll = useCallback((data: T) => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors<T> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof T;
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    if (validateOnChange && touched.has(name)) {
      validateField(name, value);
    }
  }, [validateField, validateOnChange, touched]);

  const handleBlur = useCallback((name: keyof T, value: any) => {
    setTouched(prev => new Set(prev).add(name));
    if (validateOnBlur) {
      validateField(name, value);
    }
  }, [validateField, validateOnBlur]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    touched,
    hasErrors,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    clearErrors
  };
};

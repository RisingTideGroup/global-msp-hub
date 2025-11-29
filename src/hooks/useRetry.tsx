
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  onError?: (error: Error, attempt: number) => void;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxAttempts = 3, delay = 1000, onError } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { toast } = useToast();

  const retry = useCallback(async <T,>(
    fn: () => Promise<T>,
    customMaxAttempts?: number
  ): Promise<T> => {
    const maxRetries = customMaxAttempts || maxAttempts;
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        setAttempt(i + 1);
        if (i > 0) {
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, delay * i));
        }
        
        const result = await fn();
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        onError?.(lastError, i + 1);
        
        if (i === maxRetries - 1) {
          setIsRetrying(false);
          setAttempt(0);
          toast({
            title: "Request Failed",
            description: `Failed after ${maxRetries} attempts. Please try again later.`,
            variant: "destructive"
          });
          throw lastError;
        }
      }
    }

    throw lastError!;
  }, [maxAttempts, delay, onError, toast]);

  return { retry, isRetrying, attempt };
};

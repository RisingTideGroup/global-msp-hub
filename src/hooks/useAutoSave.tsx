
import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  storageKey?: string;
}

export const useAutoSave = <T extends Record<string, any>>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  storageKey
}: UseAutoSaveOptions<T>) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  // Save to localStorage if storageKey is provided
  const saveToLocalStorage = useCallback((data: T) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }, [storageKey]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): T | null => {
    if (!storageKey) return null;
    
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }, [storageKey]);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Auto-save logic
  useEffect(() => {
    if (!enabled) return;

    const dataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (dataString === lastSavedRef.current || isSavingRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save to localStorage immediately
    saveToLocalStorage(data);

    // Set up debounced server save
    timeoutRef.current = setTimeout(async () => {
      try {
        isSavingRef.current = true;
        await onSave(data);
        lastSavedRef.current = dataString;
        
        // Clear localStorage after successful save
        clearLocalStorage();
        
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved automatically.",
          duration: 2000,
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: "Auto-save failed",
          description: "We couldn't save your changes. Please save manually.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        isSavingRef.current = false;
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, toast, saveToLocalStorage, clearLocalStorage]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = JSON.stringify(data);
      clearLocalStorage();
      
      toast({
        title: "Saved",
        description: "Your changes have been saved.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Manual save failed:', error);
      toast({
        title: "Save failed",
        description: "We couldn't save your changes. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, toast, clearLocalStorage]);

  return {
    saveNow,
    loadFromLocalStorage,
    clearLocalStorage,
    isSaving: isSavingRef.current
  };
};

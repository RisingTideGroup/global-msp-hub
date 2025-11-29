
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { shouldBypassTurnstile, getBypassToken } from "@/utils/turnstileBypass";

interface TurnstileWidgetProps {
  onSuccess?: (token: string) => void;
  onError?: () => void;
  className?: string;
  onResetReady?: (resetFn: () => void) => void;
}

export const TurnstileWidget = ({ onSuccess, onError, className, onResetReady }: TurnstileWidgetProps) => {
  const isBypassed = shouldBypassTurnstile();
  
  // Auto-trigger success when bypassed
  useEffect(() => {
    if (isBypassed && onSuccess) {
      onSuccess(getBypassToken());
    }
  }, [isBypassed, onSuccess]);
  
  if (isBypassed) {
    return null;
  }

  const turnstileRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const MAX_RETRIES = 3;

  useEffect(() => {
    // Fetch site key from edge function
    const fetchSiteKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-turnstile-config');
        
        if (error) {
          console.error('Error fetching Turnstile config:', error);
          toast({
            title: "Configuration Error",
            description: "Failed to load security configuration. Please try again.",
            variant: "destructive"
          });
          onError?.();
          return;
        }

        if (data.siteKey) {
          setSiteKey(data.siteKey);
        } else {
          console.error('No site key received from config');
          onError?.();
        }
      } catch (err) {
        console.error('Error fetching site key:', err);
        onError?.();
      }
    };

    fetchSiteKey();
  }, [onError, toast]);

  useEffect(() => {
    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleTurnstileError = (errorCode?: string) => {
    console.log('Turnstile error occurred with code:', errorCode);
    
    // Parse error code to determine if we should retry or show permanent error
    const shouldAutoRetry = (code?: string): boolean => {
      if (!code) return true; // Generic errors get one retry
      
      // Temporary client-side problems - auto retry
      if (code.startsWith('300') || // Generic client execution error
          code.startsWith('11060') || // Challenge timeout
          code.startsWith('11062') || // Challenge timeout (system clock)
          code.startsWith('600')) { // Challenge execution failure
        return true;
      }
      
      return false;
    };
    
    const isPermanentError = (code?: string): boolean => {
      if (!code) return false;
      
      // Configuration or browser issues - permanent failures
      return code.startsWith('110100') || // Invalid sitekey
             code.startsWith('110200') || // Unknown domain
             code.startsWith('110420') || // Invalid action
             code.startsWith('110430') || // Invalid cData
             code.startsWith('110500') || // Unsupported browser
             code.startsWith('110510') || // Inconsistent user-agent
             code.startsWith('200010') || // Invalid caching
             code.startsWith('200100');   // Time problem
    };
    
    if (shouldAutoRetry(errorCode) && retryCount < MAX_RETRIES) {
      // Auto-retry for temporary issues
      console.log(`Auto-retrying Turnstile (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount(prev => prev + 1);
      
      // Reset the widget after a short delay
      setTimeout(() => {
        if (widgetId && isLoaded) {
          // @ts-ignore - Turnstile is loaded from external script
          window.turnstile?.reset(widgetId);
        }
      }, 1000);
      
      return;
    }
    
    if (isPermanentError(errorCode)) {
      // Show specific error messages for permanent issues
      let errorMessage = "There was a configuration error with the security check.";
      
      if (errorCode?.startsWith('110500') || errorCode?.startsWith('110510')) {
        errorMessage = "Your browser is not supported. Please update your browser or disable extensions that might interfere.";
      } else if (errorCode?.startsWith('200010')) {
        errorMessage = "Please clear your browser cache and try again.";
      } else if (errorCode?.startsWith('200100')) {
        errorMessage = "Please check your system clock is set correctly and try again.";
      }
      
      toast({
        title: "Security Check Error",
        description: errorMessage,
        variant: "destructive"
      });
    } else if (retryCount >= MAX_RETRIES) {
      // Show error after max retries exceeded
      toast({
        title: "Security Check Failed",
        description: "Unable to complete security verification. Please refresh the page and try again.",
        variant: "destructive"
      });
    }
    
    onError?.();
  };

  useEffect(() => {
    if (isLoaded && turnstileRef.current && !widgetId && siteKey) {
      // Clear any existing content
      turnstileRef.current.innerHTML = '';
      
      // @ts-ignore - Turnstile is loaded from external script
      const id = window.turnstile?.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log('Turnstile token received:', token);
          setRetryCount(0); // Reset retry count on success
          onSuccess?.(token);
        },
        'error-callback': handleTurnstileError,
        'expired-callback': () => {
          console.log('Turnstile token expired');
          // Auto-reset when token expires
          setTimeout(() => reset(), 100);
        }
      });

      if (id) {
        setWidgetId(id);
        console.log('Turnstile widget created with ID:', id);
      }
    }
  }, [isLoaded, siteKey, onSuccess, retryCount, widgetId]);

  const reset = () => {
    // Reset all local state first
    setRetryCount(0);
    
    if (widgetId && isLoaded) {
      try {
        // @ts-ignore - Turnstile is loaded from external script
        window.turnstile?.reset(widgetId);
        console.log('Turnstile widget reset called for widget:', widgetId);
      } catch (error) {
        console.error('Error resetting Turnstile widget:', error);
        // If reset fails, try to remove and recreate the widget
        if (turnstileRef.current) {
          turnstileRef.current.innerHTML = '';
          setWidgetId(null);
          // Widget will be recreated by the useEffect
        }
      }
    }
  };

  // Provide reset function to parent component
  useEffect(() => {
    if (onResetReady && widgetId) {
      onResetReady(reset);
    }
  }, [widgetId, onResetReady]);

  if (!siteKey) {
    return (
      <div className={className}>
        <div className="text-center text-gray-500">Loading security check...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={turnstileRef} />
    </div>
  );
};

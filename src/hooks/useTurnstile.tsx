import { useState, useCallback, useRef, useEffect } from "react";
import { shouldBypassTurnstile, getBypassToken } from "@/utils/turnstileBypass";

export const useTurnstile = () => {
  const isBypassed = shouldBypassTurnstile();
  
  const [isVerified, setIsVerified] = useState(isBypassed);
  const [token, setToken] = useState<string | null>(isBypassed ? getBypassToken() : null);
  const [isLoading, setIsLoading] = useState(false);
  const turnstileResetRef = useRef<(() => void) | null>(null);
  const onSuccessCallbackRef = useRef<((token: string) => void) | null>(null);

  // Auto-trigger success callback when bypassed
  useEffect(() => {
    if (isBypassed && onSuccessCallbackRef.current) {
      onSuccessCallbackRef.current(getBypassToken());
    }
  }, [isBypassed]);

  const handleSuccess = useCallback((verificationToken: string) => {
    setToken(verificationToken);
    setIsVerified(true);
    setIsLoading(false);
    // Store the callback for bypass scenarios
    if (onSuccessCallbackRef.current) {
      onSuccessCallbackRef.current(verificationToken);
    }
  }, []);

  const handleError = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setIsLoading(false);
  }, []);
  
  // Register the success callback
  const registerSuccessCallback = useCallback((callback: (token: string) => void) => {
    onSuccessCallbackRef.current = callback;
    // If already bypassed, trigger immediately
    if (isBypassed) {
      callback(getBypassToken());
    }
  }, [isBypassed]);

  const reset = useCallback(() => {
    console.log('Resetting Turnstile state');
    setToken(null);
    setIsVerified(false);
    setIsLoading(false);
    // Call the Turnstile widget reset if available
    if (turnstileResetRef.current) {
      console.log('Calling Turnstile widget reset');
      turnstileResetRef.current();
    }
  }, []);

  const startVerification = useCallback(() => {
    setIsLoading(true);
  }, []);

  const setTurnstileReset = useCallback((resetFn: () => void) => {
    turnstileResetRef.current = resetFn;
  }, []);

  return {
    isVerified,
    token,
    isLoading,
    isBypassed,
    handleSuccess,
    handleError,
    reset,
    startVerification,
    setTurnstileReset,
    registerSuccessCallback
  };
};

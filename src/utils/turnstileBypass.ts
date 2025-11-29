/**
 * Determines if Turnstile verification should be bypassed
 * Returns true for Lovable preview environments, false for production
 */
export const shouldBypassTurnstile = (): boolean => {
  return window.location.hostname.includes('lovableproject.com');
};

/**
 * Gets a bypass token when Turnstile is disabled
 */
export const getBypassToken = (): string => {
  return 'lovable-preview-bypass';
};

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitTracking = (type: 'job' | 'business', id: string | undefined) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!id || tracked.current) return;

    const trackVisit = async () => {
      try {
        const { error } = await supabase.functions.invoke('track-visit', {
          body: { type, id }
        });

        if (error) {
          console.error('Error tracking visit:', error);
        } else {
          tracked.current = true;
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    // Track after a short delay to ensure it's a real visit
    const timer = setTimeout(trackVisit, 2000);

    return () => clearTimeout(timer);
  }, [type, id]);
};

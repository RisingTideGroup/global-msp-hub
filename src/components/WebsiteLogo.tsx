import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebsiteLogoProps {
  url: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export const WebsiteLogo = ({ url, alt, fallbackText, className = "w-12 h-12" }: WebsiteLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-website-logo', {
          body: { url }
        });

        if (error) throw error;

        if (data?.logoUrl) {
          setLogoUrl(data.logoUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [url]);

  if (loading) {
    return (
      <div className={`${className} bg-gradient-to-br from-brand-secondary/30 to-blue-50/30 rounded-lg animate-pulse`} />
    );
  }

  if (error || !logoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`${className} rounded-lg object-cover`}
      onError={() => setError(true)}
    />
  );
};

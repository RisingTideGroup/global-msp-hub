import { useEffect, useState } from "react";
import { useWebsiteLogo } from "@/hooks/useWebsiteLogo";

interface WebsiteLogoProps {
  url: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export const WebsiteLogo = ({ url, alt, fallbackText, className = "w-12 h-12" }: WebsiteLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const { mutate: fetchLogo } = useWebsiteLogo();

  useEffect(() => {
    fetchLogo(url, {
      onSuccess: (data) => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        } else {
          setError(true);
        }
      },
      onError: () => {
        setError(true);
      },
    });
  }, [url, fetchLogo]);

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
